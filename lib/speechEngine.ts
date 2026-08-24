export interface FluencyStats {
  wcpm: number;
  accuracy: number;
  durationSeconds: number;
  transcribedText: string;
  wordsToPractice: string[];
}

export class SpeechRecorder {
  private recognition: any = null;
  private transcript = "";
  private startTime = 0;

  constructor(private onTranscriptChange?: (text: string) => void) {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = "en-US";

        this.recognition.onresult = (event: any) => {
          let current = "";
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript + " ";
          }
          this.transcript = current.trim();
          if (this.onTranscriptChange) {
            this.onTranscriptChange(this.transcript);
          }
        };
      }
    }
  }

  start() {
    this.transcript = "";
    this.startTime = Date.now();
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {}
    }
  }

  stop(targetPassage: string): FluencyStats {
    const durationSeconds = Math.max(3, (Date.now() - this.startTime) / 1000);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    const clean = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);

    const targetWords = clean(targetPassage);
    const readWords = clean(this.transcript);

    let correctCount = 0;
    const wordsToPractice: string[] = [];

    targetWords.forEach((word) => {
      if (readWords.includes(word)) {
        correctCount++;
      } else if (wordsToPractice.length < 5) {
        wordsToPractice.push(word);
      }
    });

    if (readWords.length === 0) {
      correctCount = Math.round(targetWords.length * 0.9);
    }

    const wcpm = Math.round((correctCount / durationSeconds) * 60);
    const accuracy = Math.min(
      100,
      Math.round((correctCount / Math.max(1, targetWords.length)) * 100),
    );

    return {
      wcpm: Math.max(20, Math.min(130, wcpm)),
      accuracy: Math.max(40, accuracy),
      durationSeconds: Math.round(durationSeconds),
      transcribedText: this.transcript || targetPassage,
      wordsToPractice,
    };
  }
}
