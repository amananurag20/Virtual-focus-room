import { useState, useCallback, useRef, useEffect } from 'react';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

export function useWebRTC(socket, localStream) {
    const [peers, setPeers] = useState({});
    const [remoteStreams, setRemoteStreams] = useState({});
    const peerConnections = useRef({});

    const createPeerConnection = useCallback((targetSocketId, username) => {
        if (peerConnections.current[targetSocketId]) {
            return peerConnections.current[targetSocketId];
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks to connection
        if (localStream) {
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });
        }

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('webrtc:ice-candidate', {
                    to: targetSocketId,
                    candidate: event.candidate
                });
            }
        };

        // Handle remote stream
        pc.ontrack = (event) => {
            const [remoteStream] = event.streams;
            setRemoteStreams(prev => ({
                ...prev,
                [targetSocketId]: remoteStream
            }));
        };

        pc.onconnectionstatechange = () => {
            console.log(`Connection state with ${targetSocketId}:`, pc.connectionState);
            if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                closePeerConnection(targetSocketId);
            }
        };

        peerConnections.current[targetSocketId] = pc;
        setPeers(prev => ({
            ...prev,
            [targetSocketId]: { socketId: targetSocketId, username }
        }));

        return pc;
    }, [socket, localStream]);

    const closePeerConnection = useCallback((socketId) => {
        const pc = peerConnections.current[socketId];
        if (pc) {
            pc.close();
            delete peerConnections.current[socketId];
        }

        setPeers(prev => {
            const updated = { ...prev };
            delete updated[socketId];
            return updated;
        });

        setRemoteStreams(prev => {
            const updated = { ...prev };
            delete updated[socketId];
            return updated;
        });
    }, []);

    const initiateCall = useCallback(async (targetSocketId, username) => {
        const pc = createPeerConnection(targetSocketId, username);

        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('webrtc:offer', {
                to: targetSocketId,
                offer
            });
        } catch (err) {
            console.error('Error creating offer:', err);
        }
    }, [createPeerConnection, socket]);

    const handleOffer = useCallback(async ({ from, username, offer }) => {
        const pc = createPeerConnection(from, username);

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit('webrtc:answer', {
                to: from,
                answer
            });
        } catch (err) {
            console.error('Error handling offer:', err);
        }
    }, [createPeerConnection, socket]);

    const handleAnswer = useCallback(async ({ from, answer }) => {
        const pc = peerConnections.current[from];
        if (pc) {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (err) {
                console.error('Error handling answer:', err);
            }
        }
    }, []);

    const handleIceCandidate = useCallback(async ({ from, candidate }) => {
        const pc = peerConnections.current[from];
        if (pc && candidate) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error('Error adding ICE candidate:', err);
            }
        }
    }, []);

    const closeAllConnections = useCallback(() => {
        Object.keys(peerConnections.current).forEach(closePeerConnection);
    }, [closePeerConnection]);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('webrtc:offer', handleOffer);
        socket.on('webrtc:answer', handleAnswer);
        socket.on('webrtc:ice-candidate', handleIceCandidate);

        return () => {
            socket.off('webrtc:offer', handleOffer);
            socket.off('webrtc:answer', handleAnswer);
            socket.off('webrtc:ice-candidate', handleIceCandidate);
        };
    }, [socket, handleOffer, handleAnswer, handleIceCandidate]);

    // Update tracks when local stream changes
    useEffect(() => {
        if (!localStream) return;

        Object.values(peerConnections.current).forEach(pc => {
            const senders = pc.getSenders();
            localStream.getTracks().forEach(track => {
                const sender = senders.find(s => s.track?.kind === track.kind);
                if (sender) {
                    sender.replaceTrack(track);
                }
            });
        });
    }, [localStream]);

    return {
        peers,
        remoteStreams,
        initiateCall,
        closePeerConnection,
        closeAllConnections
    };
}
