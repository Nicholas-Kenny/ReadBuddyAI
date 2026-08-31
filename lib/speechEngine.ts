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
  private isRecording = false; // Penanda untuk mencegah HP mematikan mic

  constructor(private onTranscriptChange?: (text: string) => void) {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = "en-US"; // Biarkan English untuk akurasi MVP

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

        // FIX UNTUK MOBILE: Jika browser HP mematikan mic diam-diam, paksa nyalakan lagi!
        this.recognition.onend = () => {
          if (this.isRecording) {
            try {
              this.recognition.start();
            } catch (e) {}
          }
        };

        // Menangkap error jika user menolak izin mic
        this.recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            this.isRecording = false;
            alert(
              "Akses Mikrofon diblokir. Mohon izinkan mikrofon di pengaturan browser HP Anda.",
            );
          }
        };
      }
    }
  }

  start() {
    this.transcript = "";
    this.startTime = Date.now();
    this.isRecording = true;

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        console.error("Failed to start mic", e);
      }
    } else {
      // Peringatan jika browser HP sama sekali tidak mendukung Web Speech API
      alert(
        "Browser ini tidak mendukung Perekam Suara AI. Mohon gunakan Safari (iPhone) atau Google Chrome (Android).",
      );
    }
  }

  stop(targetPassage: string): FluencyStats {
    this.isRecording = false; // Menghentikan loop auto-restart
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

    // Hal ini penting agar kita tahu jika sistem gagal merekam.
    if (readWords.length === 0 && this.transcript.length === 0) {
      correctCount = 0;
    }

    const wcpm = Math.round((correctCount / durationSeconds) * 60);
    const accuracy = Math.min(
      100,
      Math.round((correctCount / Math.max(1, targetWords.length)) * 100),
    );

    return {
      wcpm: Math.max(0, Math.min(130, wcpm)),
      accuracy: Math.max(0, accuracy),
      durationSeconds: Math.round(durationSeconds),
      transcribedText: this.transcript,
      wordsToPractice,
    };
  }
}
