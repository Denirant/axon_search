import React from 'react';

const CircularSpinner = ({ 
  rotationSpeed = 1, // секунд на оборот
  dashSpeed = 1.75,   // секунд на цикл изменения дуги
  minDashOffset = 30, // минимальное значение dashOffset 
  maxDashOffset = 80, // максимальное значение dashOffset
  size = 50,          // размер SVG
  thickness = 4,      // толщина линии
  color = "#5c5c5c",     // цвет активной дуги
  bgColor = "#f5f5f5" // цвет фонового круга
}) => {
  const radius = size * 0.4; // радиус круга (40% от размера SVG)
  const circumference = 2 * Math.PI * radius; // длина окружности
  
  const uniqueId = React.useId().replace(/:/g, '');
  const dashAnimName = `dash-${uniqueId}`;
  const spinAnimName = `spin-${uniqueId}`;
  
  return (
    <div className="flex items-center justify-center">
      <svg 
        className="w-12 h-12" 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={thickness}
        />
        
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.5} // Начальное значение (50%)
          style={{
            transformOrigin: 'center',
            animation: `${dashAnimName} ${dashSpeed}s ease-in-out infinite, ${spinAnimName} ${rotationSpeed}s linear infinite`,
          }}
        />
        
        <style>{`
          @keyframes ${dashAnimName} {
            0% {
              stroke-dashoffset: ${circumference * maxDashOffset/100};
            }
            50% {
              stroke-dashoffset: ${circumference * minDashOffset/100};
            }
            100% {
              stroke-dashoffset: ${circumference * maxDashOffset/100};
            }
          }
          
          @keyframes ${spinAnimName} {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </svg>
    </div>
  );
};

export default CircularSpinner;