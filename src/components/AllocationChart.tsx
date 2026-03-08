interface Allocation {
  name: string;
  weight: number;
  color: string;
}

const DEFAULT_ALLOCATIONS: Allocation[] = [
  { name: "Hydration LP", weight: 40, color: "#E6007A" },
  { name: "Moonbeam Lending", weight: 30, color: "#53CBC9" },
  { name: "Acala Staking", weight: 30, color: "#FF4B4B" },
];

export function AllocationChart({ allocations = DEFAULT_ALLOCATIONS }: { allocations?: Allocation[] }) {
  const total = allocations.reduce((sum, a) => sum + a.weight, 0);
  let cumulative = 0;

  const arcs = allocations.map((a) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += a.weight;
    const endAngle = (cumulative / total) * 360;
    return { ...a, startAngle, endAngle };
  });

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(50, 50, 40, endAngle);
    const end = polarToCartesian(50, 50, 40, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M 50 50 L ${start.x} ${start.y} A 40 40 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-white">Allocation</h3>
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-64 h-64">
          {arcs.map((arc, i) => (
            <path
              key={i}
              d={describeArc(arc.startAngle, arc.endAngle)}
              fill={arc.color}
              stroke="#1f2937"
              strokeWidth="0.5"
            />
          ))}
          <circle cx="50" cy="50" r="20" fill="#1f2937" />
        </svg>
      </div>
      <div className="mt-4 space-y-2">
        {allocations.map((a) => (
          <div key={a.name} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: a.color }} />
              <span className="text-gray-300">{a.name}</span>
            </div>
            <span className="text-white font-semibold">{a.weight}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
