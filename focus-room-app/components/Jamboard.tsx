import React, { useState, useRef, useEffect } from "react";
import {
    View,
    StyleSheet,
    Dimensions,
    Pressable,
    Text,
    Modal,
    GestureResponderEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Line } from "react-native-svg";
import { useSocket } from "@/context/SocketContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CANVAS_WIDTH = SCREEN_WIDTH - 32;
const CANVAS_HEIGHT = SCREEN_HEIGHT * 0.6;

// Line segment format (compatible with browser Whiteboard)
type DrawLine = {
    x0: number;  // normalized 0-1
    y0: number;
    x1: number;
    y1: number;
    color: string;
    width: number;
};

const COLORS = [
    "#ffffff", // White
    "#ef4444", // Red
    "#f97316", // Orange
    "#eab308", // Yellow
    "#22c55e", // Green
    "#3b82f6", // Blue
    "#8b5cf6", // Purple
    "#ec4899", // Pink
];

const STROKE_WIDTHS = [2, 4, 6, 8, 12];

type JamboardProps = {
    visible: boolean;
    onClose: () => void;
};

export default function Jamboard({ visible, onClose }: JamboardProps) {
    const { socket, isConnected, currentRoom } = useSocket();
    const [lines, setLines] = useState<DrawLine[]>([]);
    const [selectedColor, setSelectedColor] = useState("#ffffff");
    const [strokeWidth, setStrokeWidth] = useState(4);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [isEraser, setIsEraser] = useState(false);
    const lastPosRef = useRef<{ x: number; y: number } | null>(null);
    const isDrawingRef = useRef(false);

    // Request history when opening
    useEffect(() => {
        if (visible && socket && isConnected) {
            socket.emit("whiteboard:request-history");
        }
    }, [visible, socket, isConnected]);

    // Listen for whiteboard events
    useEffect(() => {
        if (!socket) return;

        // Helper to validate incoming line data
        const isValidLine = (line: DrawLine): boolean => {
            return line &&
                typeof line.x0 === 'number' &&
                typeof line.y0 === 'number' &&
                typeof line.x1 === 'number' &&
                typeof line.y1 === 'number' &&
                typeof line.color === 'string' &&
                typeof line.width === 'number';
        };

        // Receive drawing from others
        const onDraw = (data: DrawLine) => {
            if (isValidLine(data)) {
                setLines((prev) => [...prev, data]);
            }
        };

        // Receive clear event
        const onClear = () => {
            setLines([]);
        };

        // Receive history
        const onHistory = (history: DrawLine[]) => {
            if (history && Array.isArray(history)) {
                const validHistory = history.filter(isValidLine);
                if (validHistory.length > 0) {
                    setLines(validHistory);
                }
            }
        };

        socket.on("whiteboard:draw", onDraw);
        socket.on("whiteboard:clear", onClear);
        socket.on("whiteboard:history", onHistory);

        return () => {
            socket.off("whiteboard:draw", onDraw);
            socket.off("whiteboard:clear", onClear);
            socket.off("whiteboard:history", onHistory);
        };
    }, [socket]);

    // Get normalized coordinates (0-1) from touch event
    const getNormalizedCoords = (e: GestureResponderEvent) => {
        const { locationX, locationY } = e.nativeEvent;
        return {
            x: locationX / CANVAS_WIDTH,
            y: locationY / CANVAS_HEIGHT
        };
    };

    // Handle touch start
    const handleTouchStart = (e: GestureResponderEvent) => {
        isDrawingRef.current = true;
        const coords = getNormalizedCoords(e);
        lastPosRef.current = coords;
    };

    // Handle touch move
    const handleTouchMove = (e: GestureResponderEvent) => {
        if (!isDrawingRef.current || !lastPosRef.current) return;

        const coords = getNormalizedCoords(e);
        const { x: lastX, y: lastY } = lastPosRef.current;

        const newLine: DrawLine = {
            x0: lastX,
            y0: lastY,
            x1: coords.x,
            y1: coords.y,
            color: isEraser ? "#0f0f2a" : selectedColor,
            width: isEraser ? strokeWidth * 3 : strokeWidth,
        };

        // Add line locally
        setLines((prev) => [...prev, newLine]);

        // Emit to other users
        if (socket && isConnected) {
            socket.emit("whiteboard:draw", {
                roomId: currentRoom?.id,
                ...newLine
            });
        }

        lastPosRef.current = coords;
    };

    // Handle touch end
    const handleTouchEnd = () => {
        isDrawingRef.current = false;
        lastPosRef.current = null;
    };

    // Clear the canvas
    const handleClear = () => {
        setLines([]);
        if (socket && isConnected) {
            socket.emit("whiteboard:clear", { roomId: currentRoom?.id });
        }
    };

    // Undo last line
    const handleUndo = () => {
        if (lines.length > 0) {
            setLines((prev) => prev.slice(0, -1));
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
            <LinearGradient colors={["#0a0a1a", "#0f0f2a", "#1a1a35"]} style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable style={styles.closeBtn} onPress={onClose}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </Pressable>
                    <View style={styles.headerCenter}>
                        <Ionicons name="easel" size={20} color="#a78bfa" />
                        <Text style={styles.title}>Jamboard</Text>
                        {isConnected && (
                            <View style={styles.syncBadge}>
                                <View style={styles.syncDot} />
                                <Text style={styles.syncText}>Synced</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.headerActions}>
                        <Pressable style={styles.actionBtn} onPress={handleUndo}>
                            <Ionicons name="arrow-undo" size={20} color="#9ca3af" />
                        </Pressable>
                        <Pressable style={styles.actionBtn} onPress={handleClear}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </Pressable>
                    </View>
                </View>

                {/* Canvas */}
                <View style={styles.canvasContainer}>
                    <View
                        style={styles.canvas}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={styles.svg}>
                            {/* Render all lines */}
                            {lines.map((line, index) => (
                                <Line
                                    key={index}
                                    x1={line.x0 * CANVAS_WIDTH}
                                    y1={line.y0 * CANVAS_HEIGHT}
                                    x2={line.x1 * CANVAS_WIDTH}
                                    y2={line.y1 * CANVAS_HEIGHT}
                                    stroke={line.color}
                                    strokeWidth={line.width}
                                    strokeLinecap="round"
                                />
                            ))}
                        </Svg>
                    </View>
                </View>

                {/* Toolbar */}
                <View style={styles.toolbar}>
                    {/* Color Picker Toggle */}
                    <Pressable
                        style={[styles.toolBtn, showColorPicker && styles.toolBtnActive]}
                        onPress={() => setShowColorPicker(!showColorPicker)}
                    >
                        <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
                    </Pressable>

                    {/* Pen Tool */}
                    <Pressable
                        style={[styles.toolBtn, !isEraser && styles.toolBtnActive]}
                        onPress={() => setIsEraser(false)}
                    >
                        <Ionicons name="pencil" size={24} color={!isEraser ? "#a78bfa" : "#9ca3af"} />
                    </Pressable>

                    {/* Eraser Tool */}
                    <Pressable
                        style={[styles.toolBtn, isEraser && styles.toolBtnActive]}
                        onPress={() => setIsEraser(true)}
                    >
                        <Ionicons name="bandage" size={24} color={isEraser ? "#a78bfa" : "#9ca3af"} />
                    </Pressable>

                    {/* Stroke Width */}
                    <View style={styles.strokeContainer}>
                        {STROKE_WIDTHS.map((width) => (
                            <Pressable
                                key={width}
                                style={[styles.strokeBtn, strokeWidth === width && styles.strokeBtnActive]}
                                onPress={() => setStrokeWidth(width)}
                            >
                                <View
                                    style={[
                                        styles.strokePreview,
                                        { width: width + 8, height: width + 8 },
                                        strokeWidth === width && styles.strokePreviewActive,
                                    ]}
                                />
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Color Picker Panel */}
                {showColorPicker && (
                    <View style={styles.colorPicker}>
                        <Text style={styles.colorPickerTitle}>Select Color</Text>
                        <View style={styles.colorGrid}>
                            {COLORS.map((color) => (
                                <Pressable
                                    key={color}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.colorOptionActive,
                                    ]}
                                    onPress={() => {
                                        setSelectedColor(color);
                                        setIsEraser(false);
                                        setShowColorPicker(false);
                                    }}
                                >
                                    {selectedColor === color && (
                                        <Ionicons name="checkmark" size={20} color={color === "#ffffff" ? "#000" : "#fff"} />
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}
            </LinearGradient>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.1)",
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerCenter: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    title: { color: "#fff", fontSize: 18, fontWeight: "600" },
    syncBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(16,185,129,0.2)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    syncDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10b981" },
    syncText: { color: "#10b981", fontSize: 11, fontWeight: "600" },
    headerActions: { flexDirection: "row", gap: 8 },
    actionBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },

    // Canvas
    canvasContainer: {
        flex: 1,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    canvas: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: "#0f0f2a",
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "rgba(139,92,246,0.3)",
        overflow: "hidden",
    },
    svg: { backgroundColor: "transparent" },

    // Toolbar
    toolbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
    },
    toolBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    toolBtnActive: {
        backgroundColor: "rgba(139,92,246,0.3)",
        borderWidth: 2,
        borderColor: "#a78bfa",
    },
    colorPreview: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#fff",
    },
    strokeContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 24,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    strokeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    strokeBtnActive: {
        backgroundColor: "rgba(139,92,246,0.3)",
    },
    strokePreview: {
        backgroundColor: "#9ca3af",
        borderRadius: 20,
    },
    strokePreviewActive: {
        backgroundColor: "#a78bfa",
    },

    // Color Picker
    colorPicker: {
        position: "absolute",
        bottom: 100,
        left: 16,
        right: 16,
        backgroundColor: "rgba(15,15,42,0.98)",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    colorPickerTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 16,
    },
    colorGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 12,
    },
    colorOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "transparent",
    },
    colorOptionActive: {
        borderColor: "#fff",
    },
});
