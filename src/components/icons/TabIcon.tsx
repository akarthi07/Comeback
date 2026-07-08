import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';

export type TabName = 'dashboard' | 'measure' | 'confidence' | 'trend' | 'ladder';

/**
 * Hand-built line icons so the tab bar reads as one designed set rather than a
 * grab-bag from an icon font. 24x24 grid, 2px stroke, rounded joins.
 */
export function TabIcon({ name, color, size = 24 }: { name: TabName; color: string; size?: number }) {
  const stroke = { stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'dashboard' && (
        <>
          {/* a readiness gauge / speedometer arc with a needle */}
          <Path d="M4 15a8 8 0 0 1 16 0" {...stroke} />
          <Line x1="12" y1="15" x2="16" y2="10" {...stroke} />
          <Circle cx="12" cy="15" r="1.6" fill={color} />
        </>
      )}
      {name === 'measure' && (
        <>
          {/* a flexed-leg angle: hip -> knee -> ankle with an arc */}
          <Polyline points="5,4 12,13 19,13" {...stroke} />
          <Path d="M12 13a6 6 0 0 0 3.2 -1" {...stroke} />
          <Circle cx="12" cy="13" r="1.4" fill={color} />
        </>
      )}
      {name === 'confidence' && (
        <>
          {/* a shield with a check — trust / readiness of mind */}
          <Path d="M12 3l7 3v5c0 4.5 -3 7.5 -7 9c-4 -1.5 -7 -4.5 -7 -9V6z" {...stroke} />
          <Polyline points="9,12 11.2,14 15,9.5" {...stroke} />
        </>
      )}
      {name === 'trend' && (
        <>
          {/* an upward trend line */}
          <Polyline points="4,16 9,11 13,14 20,6" {...stroke} />
          <Polyline points="15,6 20,6 20,11" {...stroke} />
        </>
      )}
      {name === 'ladder' && (
        <>
          {/* ascending steps */}
          <Polyline points="4,20 9,20 9,14 14,14 14,8 20,8" {...stroke} />
          <Line x1="4" y1="20" x2="4" y2="16" {...stroke} />
        </>
      )}
    </Svg>
  );
}
