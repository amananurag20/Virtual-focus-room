import { useTheme } from '@/context/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HiComputerDesktop, HiXMark, HiWindow } from 'react-icons/hi2';

export default function ScreenSourcePicker({
    isOpen,
    sources,
    onSelectSource,
    onClose
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Separate sources into screens and windows
    const screens = sources.filter(s => s.id.startsWith('screen:'));
    const windows = sources.filter(s => s.id.startsWith('window:'));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HiComputerDesktop className="w-5 h-5 text-primary" />
                        Share Your Screen
                    </DialogTitle>
                    <DialogDescription>
                        Choose a screen or window to share with others in the room.
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[60vh] space-y-6 pt-4">
                    {/* Screens Section */}
                    {screens.length > 0 && (
                        <div>
                            <h3 className={`text-sm font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                <HiComputerDesktop className="w-4 h-4" />
                                Entire Screen
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {screens.map((source) => (
                                    <button
                                        key={source.id}
                                        onClick={() => onSelectSource(source.id)}
                                        className={`group relative rounded-lg overflow-hidden border-2 transition-all hover:scale-102 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary ${isDark ? 'border-slate-700 hover:border-primary bg-slate-800' : 'border-slate-200 hover:border-primary bg-white'}`}
                                    >
                                        <div className="aspect-video relative">
                                            {source.thumbnail ? (
                                                <img
                                                    src={source.thumbnail}
                                                    alt={source.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                                    <HiComputerDesktop className="w-8 h-8 text-slate-400" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
                                        </div>
                                        <div className={`p-2 text-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                                            <span className={`text-xs font-medium truncate block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                                {source.name}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Windows Section */}
                    {windows.length > 0 && (
                        <div>
                            <h3 className={`text-sm font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                <HiWindow className="w-4 h-4" />
                                Application Windows
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {windows.map((source) => (
                                    <button
                                        key={source.id}
                                        onClick={() => onSelectSource(source.id)}
                                        className={`group relative rounded-lg overflow-hidden border-2 transition-all hover:scale-102 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary ${isDark ? 'border-slate-700 hover:border-primary bg-slate-800' : 'border-slate-200 hover:border-primary bg-white'}`}
                                    >
                                        <div className="aspect-video relative">
                                            {source.thumbnail ? (
                                                <img
                                                    src={source.thumbnail}
                                                    alt={source.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                                    <HiWindow className="w-8 h-8 text-slate-400" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
                                        </div>
                                        <div className={`p-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                                            <div className="flex items-center gap-2">
                                                {source.appIcon && (
                                                    <img
                                                        src={source.appIcon}
                                                        alt=""
                                                        className="w-4 h-4 shrink-0"
                                                    />
                                                )}
                                                <span className={`text-xs font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                                    {source.name}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No sources available */}
                    {sources.length === 0 && (
                        <div className="text-center py-10">
                            <HiComputerDesktop className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                No screens or windows available to share.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        <HiXMark className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
