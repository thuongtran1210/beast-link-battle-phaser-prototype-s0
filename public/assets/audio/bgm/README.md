# Beast Link Battle - Audio Assets Directory

Thư mục lưu trữ nhạc nền (BGM) và hiệu ứng âm thanh (SFX) cho game.

## Cấu trúc thư mục

- `public/assets/audio/bgm/` : Chứa nhạc nền (Background Music) định dạng `.mp3`.
  - Ví dụ: `lobby-theme.mp3` (Nhạc nền sảnh chờ / Menu chính / Làng Beast)
  - Ví dụ: `battle-theme.mp3` (Nhạc nền trận chiến)
- `public/assets/audio/sfx/` : Chứa âm thanh hiệu ứng (Sound Effects) định dạng `.mp3` hoặc `.wav`.

## Tiêu chuẩn file nhạc đề xuất (Audio Recommendations)

- **Định dạng**: `.mp3` (tương thích 100% tất cả trình duyệt hiện đại).
- **Sample Rate**: `44.1 kHz` hoặc `48 kHz`.
- **Bitrate**: `128 kbps - 192 kbps` (vừa tối ưu dung lượng tải web, vừa đảm bảo chất lượng).
- **Channels**: Stereo hoặc Mono.
- **Loop**: Nhạc nên được cắt chuẩn điểm loop (seamless loop) để khi lặp lại không bị giật tiếng.
