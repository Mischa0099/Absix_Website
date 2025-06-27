// Export all challenge components
export { default as Challenge1 } from './Challenge1'; // Enhanced version
export { default as CodeEditor } from './CodeEditor';
export { default as ChallengeProgressPanel } from './ChallengeProgressPanel';
export { default as ConsoleOutput } from './ConsoleOutput';
export { default as ChallengeCard } from './ChallengeCard';
export { default as ChallengeHistoryDialogue } from './ChallengeHistoryDialogue';
export { default as ChallengeMap } from './ChallengeMap';
export { default as ChallengeRunner } from './ChallengeRunner';
export { default as ControlPanel } from './ControlPanel';
export { default as GenericChallenge } from './GenericChallenge';
export { default as ManualMovementChallenge } from './ManualMovementChallenge';
export { default as PDControlChallenge } from './PDControlChallenge';
export { default as QuizChallenge } from './QuizChallenge';
export { default as ResultsDisplay } from './ResultsDisplay';
export { default as RobotVisualizer } from './RobotVisualizer';
export { default as challengeRegistry, getChallengeComponent, getAllChallenges, challengeExists } from './challengeRegistry';


// Challenge types enum for external use
export const CHALLENGE_TYPES = {
  MANUAL_MOVEMENT: 'manual_movement',
  PD_CONTROL: 'pd_control',
  QUIZ: 'quiz',
  GENERIC: 'generic'
};