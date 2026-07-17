import { useNavigation } from '@react-navigation/native';
import { useGoal, useCalibration } from '../store';
import { CalibrateStep } from '../onboarding/CalibrateStep';

/**
 * Standalone recalibration (reached from Settings). Reuses the onboarding
 * calibration step; on finish it just stores the new offset and pops back —
 * it does not touch the goal.
 */
export function CalibrateScreen() {
  const nav = useNavigation<any>();
  const leg = useGoal((s) => s.goal?.injuredLeg) ?? 'left';
  const setCalibration = useCalibration((s) => s.setCalibration);

  return (
    <CalibrateStep
      leg={leg}
      onDone={(cal) => {
        if (cal) setCalibration(cal);
        nav.goBack();
      }}
    />
  );
}
