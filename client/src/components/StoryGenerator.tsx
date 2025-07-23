import { useState, useRef, useEffect } from 'react';
import { Music, Download, Share, X } from 'lucide-react';

interface StoryGeneratorProps {
    user: {
        display_name: string;
        id: string;
    };
    topTracks?: Array<{
        name: string;
        artists: Array<{ name: string }>;
        album: { images: Array<{ url: string }> };
    }>;
    onClose: () => void;
}

export default function StoryGenerator({ user, topTracks = [], onClose }: StoryGeneratorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const generateStory = async () => {
        setIsGenerating(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size for Instagram story (9:16 aspect ratio)
        canvas.width = 1080;
        canvas.height = 1920;

        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#581c87'); // purple-900
        gradient.addColorStop(0.5, '#be185d'); // pink-700
        gradient.addColorStop(1, '#ea580c'); // orange-600

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add noise/grain texture
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
            ctx.fillRect(x, y, 1, 1);
        }
        ctx.globalAlpha = 1;

        // Add title
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px Arial, sans-serif';
        ctx.fillText('VIBECHECK', canvas.width / 2, 300);
        
        // Add user name with gradient effect
        ctx.font = 'bold 60px Arial, sans-serif';
        const nameGradient = ctx.createLinearGradient(0, 350, canvas.width, 350);
        nameGradient.addColorStop(0, '#fbbf24'); // yellow-400
        nameGradient.addColorStop(0.5, '#ec4899'); // pink-500
        nameGradient.addColorStop(1, '#22d3ee'); // cyan-400
        ctx.fillStyle = nameGradient;
        ctx.fillText(user.display_name, canvas.width / 2, 400);

        // Add subtitle
        ctx.fillStyle = '#ffffff';
        ctx.font = '36px Arial, sans-serif';
        ctx.fillText("'s Music Vibe", canvas.width / 2, 460);

        // Add top tracks
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px Arial, sans-serif';
        ctx.fillText('Currently Vibing:', 80, 600);

        const tracksToShow = topTracks.slice(0, 4);
        tracksToShow.forEach((track, index) => {
            const y = 700 + (index * 120);
            
            // Track number with circle background
            ctx.beginPath();
            ctx.arc(120, y - 15, 25, 0, 2 * Math.PI);
            ctx.fillStyle = '#22d3ee';
            ctx.fill();
            
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 32px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText((index + 1).toString(), 120, y - 5);
            
            // Track info
            ctx.textAlign = 'left';
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 38px Arial, sans-serif';
            const trackName = track.name.length > 25 ? track.name.substring(0, 25) + '...' : track.name;
            ctx.fillText(trackName, 180, y - 20);
            
            ctx.fillStyle = '#cccccc';
            ctx.font = '32px Arial, sans-serif';
            const artistName = track.artists[0]?.name || 'Unknown Artist';
            const displayArtist = artistName.length > 30 ? artistName.substring(0, 30) + '...' : artistName;
            ctx.fillText(displayArtist, 180, y + 20);
        });

        // Add QR code placeholder (simplified as a square)
        const qrSize = 200;
        const qrX = canvas.width / 2 - qrSize / 2;
        const qrY = 1400;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qrX, qrY, qrSize, qrSize);
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('QR CODE', canvas.width / 2, qrY + qrSize / 2);
        ctx.fillText('PLACEHOLDER', canvas.width / 2, qrY + qrSize / 2 + 30);

        // Add URL
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial, sans-serif';
        ctx.fillText('vibecheck.style', canvas.width / 2, qrY + qrSize + 80);

        // Add call to action
        ctx.font = '36px Arial, sans-serif';
        ctx.fillText('Check my vibe!', canvas.width / 2, qrY + qrSize + 130);

        // Add decorative music notes
        ctx.font = '60px Arial, sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('♪', 150, 200);
        ctx.fillText('♫', 850, 250);
        ctx.fillText('♪', 950, 1300);
        ctx.fillText('♫', 100, 1500);

        // Convert canvas to image
        const imageData = canvas.toDataURL('image/png');
        setGeneratedImage(imageData);
        setIsGenerating(false);
    };

    useEffect(() => {
        generateStory();
    }, []);

    const downloadImage = () => {
        if (!generatedImage) return;
        
        const link = document.createElement('a');
        link.download = `${user.display_name}_vibecheck_story.png`;
        link.href = generatedImage;
        link.click();
    };

    const shareImage = async () => {
        if (!generatedImage) return;

        try {
            // Convert data URL to blob
            const response = await fetch(generatedImage);
            const blob = await response.blob();
            
            // Create file from blob
            const file = new File([blob], `${user.display_name}_vibecheck.png`, { type: 'image/png' });
            
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `${user.display_name}'s Vibecheck`,
                    text: `Check out ${user.display_name}'s music vibe!`,
                    files: [file]
                });
            } else {
                // Fallback: copy to clipboard or download
                downloadImage();
            }
        } catch (error) {
            console.error('Error sharing image:', error);
            downloadImage(); // Fallback to download
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Instagram Story</h2>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Canvas (hidden) */}
                <canvas
                    ref={canvasRef}
                    className="hidden"
                />

                {/* Generated Story Preview */}
                {generatedImage ? (
                    <div className="space-y-4">
                        <div className="relative bg-black rounded-lg overflow-hidden aspect-[9/16]">
                            <img
                                src={generatedImage}
                                alt="Generated story"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={shareImage}
                                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-full font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Share className="h-4 w-4" />
                                Share Story
                            </button>
                            <button
                                onClick={downloadImage}
                                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-full font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </button>
                        </div>

                        <p className="text-white/60 text-sm text-center">
                            Perfect for Instagram Stories! Share your vibe with friends.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-400 mb-4"></div>
                        <p className="text-white text-lg font-semibold mb-2">
                            Creating your story...
                        </p>
                        <p className="text-white/60 text-sm text-center">
                            ✨ Generating a beautiful visual for your vibe
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}