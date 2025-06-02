import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, Info, Plus, Minus, Save } from 'lucide-react';

interface SpiderChartProps {
  data?: {
    labels: string[];
    values: number[];
  };
  onSave?: (data: { labels: string[]; values: number[] }) => void;
}

const defaultData = {
  labels: [
    'Physical Health',
    'Mental Wellbeing',
    'Career Growth',
    'Relationships',
    'Personal Development',
    'Financial Health',
    'Spiritual Growth',
    'Social Impact'
  ],
  values: [3, 4, 3, 4, 3, 3, 3, 3]
};

const SpiderChart: React.FC<SpiderChartProps> = ({ data = defaultData, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredDimension, setHoveredDimension] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [currentData, setCurrentData] = useState(data);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Draw background circles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      for (let j = 0; j < currentData.labels.length; j++) {
        const angle = (j * 2 * Math.PI) / currentData.labels.length - Math.PI / 2;
        const x = centerX + (radius * i / 5) * Math.cos(angle);
        const y = centerY + (radius * i / 5) * Math.sin(angle);
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < currentData.labels.length; i++) {
      const angle = (i * 2 * Math.PI) / currentData.labels.length - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      );
      ctx.stroke();

      // Draw labels
      ctx.fillStyle = hoveredDimension === i ? 'rgba(139, 92, 246, 1)' : 'rgba(255, 255, 255, 0.7)';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labelX = centerX + (radius + 20) * Math.cos(angle);
      const labelY = centerY + (radius + 20) * Math.sin(angle);
      ctx.fillText(currentData.labels[i], labelX, labelY);
    }

    // Draw data
    ctx.beginPath();
    ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
    for (let i = 0; i < currentData.values.length; i++) {
      const angle = (i * 2 * Math.PI) / currentData.values.length - Math.PI / 2;
      const value = currentData.values[i] / 5; // Normalize to 0-1
      const x = centerX + radius * value * Math.cos(angle);
      const y = centerY + radius * value * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw data points
    for (let i = 0; i < currentData.values.length; i++) {
      const angle = (i * 2 * Math.PI) / currentData.values.length - Math.PI / 2;
      const value = currentData.values[i] / 5;
      const x = centerX + radius * value * Math.cos(angle);
      const y = centerY + radius * value * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = hoveredDimension === i ? 'rgba(139, 92, 246, 1)' : 'rgba(139, 92, 246, 0.8)';
      ctx.fill();
    }
  }, [currentData, hoveredDimension]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Calculate distance from center
    const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    
    // Calculate angle
    let angle = Math.atan2(y - centerY, x - centerX);
    if (angle < 0) angle += 2 * Math.PI;
    angle = (angle + Math.PI / 2) % (2 * Math.PI);

    // Find the closest dimension
    const dimensionIndex = Math.round((angle * currentData.labels.length) / (2 * Math.PI)) % currentData.labels.length;
    
    // Check if mouse is within the radar area
    if (distanceFromCenter <= radius) {
      setHoveredDimension(dimensionIndex);
      setTooltipPosition({ x, y });
    } else {
      setHoveredDimension(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredDimension(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Calculate distance from center
    const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    
    // Calculate angle
    let angle = Math.atan2(y - centerY, x - centerX);
    if (angle < 0) angle += 2 * Math.PI;
    angle = (angle + Math.PI / 2) % (2 * Math.PI);

    // Find the closest dimension
    const dimensionIndex = Math.round((angle * currentData.labels.length) / (2 * Math.PI)) % currentData.labels.length;
    
    // Check if mouse is within the radar area
    if (distanceFromCenter <= radius) {
      setSelectedDimension(dimensionIndex);
    }
  };

  const updateValue = (dimensionIndex: number, delta: number) => {
    setCurrentData(prev => ({
      ...prev,
      values: prev.values.map((value, index) => 
        index === dimensionIndex ? Math.max(1, Math.min(5, value + delta)) : value
      )
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(currentData);
    }
    setIsEditing(false);
    setSelectedDimension(null);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-300" />
          <h3 className="text-xl font-medium text-gray-300">Growth Radar</h3>
        </div>
      </div>
      
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className={`w-full max-w-[400px] h-[400px] ${isEditing ? 'cursor-pointer' : ''}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />
        
        {hoveredDimension !== null && !isEditing && (
          <div 
            className="absolute bg-violet-900/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg text-sm"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y + 10,
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
          >
            <div className="font-medium">{currentData.labels[hoveredDimension]}</div>
            <div className="text-violet-300">Level: {currentData.values[hoveredDimension]}/5</div>
          </div>
        )}

        {isEditing && selectedDimension !== null && (
          <div 
            className="absolute bg-violet-900/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg"
            style={{
              top: 0,
              right: 0,
              zIndex: 10
            }}
          >
            <div className="font-medium mb-2">{currentData.labels[selectedDimension]}</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateValue(selectedDimension, -1)}
                className="p-1 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-medium">{currentData.values[selectedDimension]}/5</span>
              <button
                onClick={() => updateValue(selectedDimension, 1)}
                className="p-1 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-500/20 border border-violet-500/40" />
            <span>Current Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/10 border border-white/20" />
            <span>Target Level</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-violet-500 text-white hover:bg-violet-600 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 rounded-lg text-sm font-medium bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Edit Values
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpiderChart; 