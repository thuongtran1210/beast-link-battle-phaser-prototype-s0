/**
 * MainMenuParallax - 2D Platformer Parallax Riverside Background with 3 Animated Chibi Beasts
 * Vẽ 100% bằng HTML5 Canvas Code (không dùng ảnh AI bão hòa màu):
 * - Phong cách: Cozy, dịu mát, thanh bình miền Tây Nam Bộ (Studio Ghibli / Storybook watercolor).
 * - Bảng màu: Xanh pastel, xanh ngọc lam sông nước, nâu rơm be mộc mạc, hoa lục bình tím nhạt.
 * - 3 nhân vật Chibi có Spritesheet frame-by-frame 8-pose: Snowguard (Vịt), Ironclad (Gấu), Windstrider (Thỏ).
 */

interface FrameCell {
  x: number;
  y: number;
  width: number;
  height: number;
  groundY: number;
  bodyHeight: number;
}

interface CharacterAnimationData {
  image: HTMLImageElement;
  frames: FrameCell[];
  name: string;
  targetHeight: number;
  phaseOffset: number;
}

export class MainMenuParallax {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private container: HTMLElement;
  private animId: number = 0;
  private isDestroyed = false;

  private characters: CharacterAnimationData[] = [];
  private scrollX = 0;
  private lastTime = 0;

  // Floating ambient leaves & petals
  private leaves: Array<{
    x: number;
    y: number;
    speedX: number;
    speedY: number;
    size: number;
    rotation: number;
    rotSpeed: number;
    color: string;
  }> = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'main-menu-parallax-canvas';
    this.ctx = this.canvas.getContext('2d')!;

    // Style canvas to cover whole background behind UI
    this.canvas.style.position = 'absolute';
    this.canvas.style.inset = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = '0';
    this.canvas.style.pointerEvents = 'none';

    this.container.prepend(this.canvas);

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
    this.handleResize();

    this.initLeaves();
    this.loadAssets();
    this.startLoop();
  }

  private handleResize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
  }

  private initLeaves(): void {
    const count = 22;
    // Tông màu cánh hoa và lá xanh pastel dịu nhẹ
    const colors = ['#9ec27c', '#7da35b', '#e2d398', '#d5bfe8', '#a8d58c', '#ffffff'];
    for (let i = 0; i < count; i++) {
      this.leaves.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.85,
        speedX: 0.35 + Math.random() * 0.7,
        speedY: 0.12 + Math.random() * 0.28,
        size: 4 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  private async loadAssets(): Promise<void> {
    // Tải 3 nhân vật có spritesheet chuẩn
    const charConfigs = [
      {
        path: '/assets/characters/duck-guardian/animation_v01/',
        name: 'Snowguard',
        targetHeight: 96,
        phaseOffset: 0.0,
      },
      {
        path: '/assets/characters/bear-hammer/animation_v01/',
        name: 'Ironclad',
        targetHeight: 112,
        phaseOffset: 0.35,
      },
      {
        path: '/assets/characters/rabbit-archer/animation_v01/',
        name: 'Windstrider',
        targetHeight: 98,
        phaseOffset: 0.7,
      },
    ];

    try {
      const loaded = await Promise.all(
        charConfigs.map(async (cfg) => {
          const [framesData, img] = await Promise.all([
            fetch(cfg.path + 'frames.json').then((r) => r.json()),
            new Promise<HTMLImageElement>((resolve, reject) => {
              const image = new Image();
              image.src = cfg.path + 'walk.png';
              image.onload = () => resolve(image);
              image.onerror = reject;
            }),
          ]);

          const frames: FrameCell[] = framesData.walk || framesData.idle || [];
          return {
            image: img,
            frames,
            name: cfg.name,
            targetHeight: cfg.targetHeight,
            phaseOffset: cfg.phaseOffset,
          };
        }),
      );

      if (!this.isDestroyed) {
        this.characters = loaded;
      }
    } catch (err) {
      console.warn('MainMenuParallax: Failed to load character walk spritesheets', err);
    }
  }

  private startLoop(): void {
    const loop = (timestamp: number) => {
      if (this.isDestroyed) return;

      if (!this.lastTime) this.lastTime = timestamp;
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
      this.lastTime = timestamp;

      // Tốc độ cuộn phong cảnh êm ả (pixels per second)
      const scrollSpeed = 48;
      this.scrollX += scrollSpeed * dt;

      // Cập nhật vị trí lá rơi
      this.updateLeaves(dt);

      // Render toàn bộ các lớp phong cảnh bằng Code Canvas 2D
      this.render(timestamp);

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  private updateLeaves(dt: number): void {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    for (const leaf of this.leaves) {
      leaf.x += leaf.speedX * 60 * dt;
      leaf.y += leaf.speedY * 60 * dt;
      leaf.rotation += leaf.rotSpeed;

      if (leaf.x > width + 20) {
        leaf.x = -20;
        leaf.y = Math.random() * height * 0.8;
      }
      if (leaf.y > height) {
        leaf.y = -10;
        leaf.x = Math.random() * width;
      }
    }
  }

  private render(now: number): void {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, width, height);

    // Con đường mặt đất nằm ở khoảng 72% chiều cao màn hình (hoặc 76% trên desktop)
    const isPortrait = height > width;
    const groundY = Math.round(isPortrait ? height * 0.72 : Math.min(height * 0.76, height - 120));

    // 1. LAYER 1: BẦU TRỜI PASTEL TRONG LÀNH & MẶT TRỜI DỊU MÁT
    this.drawCozySky(width, height, groundY);

    // 2. LAYER 2: MÂY TRÔI BỒNG BỀNH (Parallax 0.04x & 0.08x)
    this.drawCozyClouds(width, groundY, this.scrollX * 0.05);

    // 3. LAYER 3: DÃY ĐỒI XANH NGỌC XA BÊN KIA SÔNG (Parallax 0.12x)
    this.drawCozyFarHills(width, groundY, this.scrollX * 0.12);

    // 4. LAYER 4: DÒNG SÔNG MEKONG XANH BÍCH & HOA LỤC BÌNH (Parallax 0.28x)
    this.drawCozyRiver(width, groundY, this.scrollX * 0.28, now);

    // 5. LAYER 5: TRUNG CẢNH BỜ SÔNG & LÀNG QUÊ MIỀN TÂY (Parallax 0.52x)
    // (Rặng dừa nghiêng bóng, nhà tranh vách nứa, bến đò, xuồng ba lá, bờ tre)
    this.drawCozyVillageMidground(width, groundY, this.scrollX * 0.52, now);

    // 6. LAYER 6: TIỀN CẢNH ĐƯỜNG MÒN CỎ HOA & ĐẤT PHÙ SA (Parallax 1.0x)
    this.drawCozyForegroundTrail(width, groundY, height, this.scrollX);

    // 7. RENDER 3 NHÂN VẬT CHIBI ANIMATION (Hành quân nhịp nhàng trên thảm cỏ)
    this.drawCharacters(width, groundY, now, isPortrait);

    // 8. NGỌN CỎ & HOA DẠI LƯỚT TRƯỚC CHÂN (Parallax 1.15x)
    this.drawFrontFoliage(width, groundY, this.scrollX * 1.15);

    // 9. LÁ RƠI & CÁNH HOA BAY CHAO LIỆNG TRONG GIÓ
    this.drawLeaves();
  }

  // =========================================================================
  // CÁC HÀM VẼ CODE CANVAS 2D THUẦN TÚY (COZY & KHÔNG ÁM VÀNG)
  // =========================================================================

  /** 1. Bầu trời sớm mai trong lành dịu mát */
  private drawCozySky(width: number, height: number, groundY: number): void {
    const ctx = this.ctx;

    // Gradient pastel thanh nhã: Xanh thiên thanh -> Xanh sữa -> Trắng ngà kem rất nhẹ -> Bạc hà
    const skyGradient = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGradient.addColorStop(0, '#cce4f2'); // Xanh thiên thanh sớm mai
    skyGradient.addColorStop(0.35, '#e0f0f5'); // Xanh sữa trong trẻo
    skyGradient.addColorStop(0.72, '#fbf8f0'); // Trắng ngà kem dịu mát (không chói gắt)
    skyGradient.addColorStop(1, '#dcefe5'); // Xanh bạc hà phảng phất nơi mặt nước
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Mặt trời sớm mai mờ ảo, dịu dàng (Gentle Morning Sun Glow)
    const sunX = width * 0.8;
    const sunY = groundY * 0.25;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 150);
    sunGrad.addColorStop(0, 'rgba(255, 255, 240, 0.7)');
    sunGrad.addColorStop(0.3, 'rgba(255, 250, 230, 0.2)');
    sunGrad.addColorStop(1, 'rgba(255, 250, 220, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 150, 0, Math.PI * 2);
    ctx.fill();

    // Vệt hào quang nắng sớm nhẹ nhàng
    ctx.fillStyle = 'rgba(255, 255, 245, 0.85)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  /** 2. Mây bồng bềnh 2 tầng trôi êm ả */
  private drawCozyClouds(width: number, groundY: number, offset: number): void {
    const ctx = this.ctx;

    // Tầng mây xa lơ lửng (fluffy distant clouds)
    const cloudLoop = 1100;
    const baseOffset = offset % cloudLoop;

    const clouds = [
      { x: 100, y: groundY * 0.14, r: 38, w: 110, alpha: 0.45 },
      { x: 460, y: groundY * 0.2, r: 32, w: 85, alpha: 0.5 },
      { x: 820, y: groundY * 0.11, r: 44, w: 130, alpha: 0.42 },
    ];

    for (let k = -1; k <= Math.ceil(width / cloudLoop) + 1; k++) {
      const shift = k * cloudLoop - baseOffset;
      for (const c of clouds) {
        const cx = c.x + shift;
        if (cx < -200 || cx > width + 200) continue;

        ctx.fillStyle = `rgba(255, 255, 255, ${c.alpha})`;
        ctx.beginPath();
        ctx.arc(cx, c.y, c.r, 0, Math.PI * 2);
        ctx.arc(cx + c.w * 0.35, c.y - 10, c.r * 1.15, 0, Math.PI * 2);
        ctx.arc(cx + c.w * 0.7, c.y + 4, c.r * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /** 3. Dãy đồi xa xanh ngọc & sương mây bên kia sông */
  private drawCozyFarHills(width: number, groundY: number, offset: number): void {
    const ctx = this.ctx;

    // Tầng 1: Dãy núi xa nhất (Pastel teal-grey mountains)
    const hillLoop1 = 1200;
    const offset1 = (offset * 0.7) % hillLoop1;
    ctx.fillStyle = '#9cbeba'; // Xanh ngọc lam mờ sương khói

    for (let k = -1; k <= Math.ceil(width / hillLoop1) + 1; k++) {
      const sx = k * hillLoop1 - offset1;
      ctx.beginPath();
      ctx.moveTo(sx, groundY);
      ctx.bezierCurveTo(sx + 260, groundY - 150, sx + 520, groundY - 170, sx + 780, groundY - 80);
      ctx.bezierCurveTo(sx + 920, groundY - 50, sx + 1040, groundY - 110, sx + hillLoop1, groundY);
      ctx.lineTo(sx, groundY);
      ctx.fill();
    }

    // Tầng 2: Dải đồi gần hơn xanh sage mát mắt
    const hillLoop2 = 880;
    const offset2 = offset % hillLoop2;
    ctx.fillStyle = '#7ba892'; // Xanh sage êm dịu

    for (let k = -1; k <= Math.ceil(width / hillLoop2) + 1; k++) {
      const sx = k * hillLoop2 - offset2;
      ctx.beginPath();
      ctx.moveTo(sx, groundY);
      ctx.bezierCurveTo(sx + 210, groundY - 105, sx + 430, groundY - 120, sx + 640, groundY - 55);
      ctx.bezierCurveTo(sx + 740, groundY - 35, sx + 800, groundY - 70, sx + hillLoop2, groundY);
      ctx.lineTo(sx, groundY);
      ctx.fill();
    }

    // Dải sương mù phủ nhẹ chân đồi tiếp giáp bờ sông
    const mistGrad = ctx.createLinearGradient(0, groundY - 60, 0, groundY);
    mistGrad.addColorStop(0, 'rgba(240, 250, 246, 0)');
    mistGrad.addColorStop(0.7, 'rgba(240, 250, 246, 0.45)');
    mistGrad.addColorStop(1, 'rgba(235, 248, 243, 0.75)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, groundY - 60, width, 60);
  }

  /** 4. Dòng sông Mekong xanh ngọc bích êm ả & hoa lục bình */
  private drawCozyRiver(width: number, groundY: number, offset: number, now: number): void {
    const ctx = this.ctx;

    // 1. Dải bờ cỏ bên kia sông
    const shoreLoop = 760;
    const shoreOffset = offset % shoreLoop;
    ctx.fillStyle = '#558765'; // Xanh rêu mát lành
    for (let k = -1; k <= Math.ceil(width / shoreLoop) + 1; k++) {
      const sx = k * shoreLoop - shoreOffset;
      ctx.beginPath();
      ctx.moveTo(sx, groundY);
      ctx.bezierCurveTo(sx + 220, groundY - 52, sx + 500, groundY - 42, sx + shoreLoop, groundY);
      ctx.fill();

      // Cụm lùm cây xa mờ bên kia sông
      ctx.fillStyle = '#477555';
      ctx.beginPath();
      ctx.arc(sx + 240, groundY - 48, 22, 0, Math.PI * 2);
      ctx.arc(sx + 275, groundY - 54, 28, 0, Math.PI * 2);
      ctx.arc(sx + 315, groundY - 46, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#558765';
    }

    // 2. Dòng nước sông ngọc bích mát rượi (River Water Band)
    const waterHeight = 52;
    const waterGrad = ctx.createLinearGradient(0, groundY - waterHeight, 0, groundY);
    waterGrad.addColorStop(0, '#4ea2a4'); // Xanh ngọc lam dịu sáng
    waterGrad.addColorStop(0.5, '#3b8689'); // Xanh ngọc bích thanh tao
    waterGrad.addColorStop(1, '#2c6e71'); // Xanh ngọc sâu lắng
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, groundY - waterHeight, width, waterHeight);

    // 3. Gợn sóng lấp lánh phản chiếu ánh sáng dịu
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const rippleSpacing = 150;
    const waveShift = (offset * 1.4) % rippleSpacing;
    for (let x = -rippleSpacing; x < width + rippleSpacing; x += rippleSpacing) {
      const rx = x - waveShift;
      const ry1 = groundY - 32 + Math.sin(now * 0.0025 + rx * 0.02) * 3;
      ctx.moveTo(rx, ry1);
      ctx.quadraticCurveTo(rx + 22, ry1 - 2.5, rx + 44, ry1);

      const ry2 = groundY - 14 + Math.sin(now * 0.003 + rx * 0.025 + 1.2) * 3.5;
      ctx.moveTo(rx + 65, ry2);
      ctx.quadraticCurveTo(rx + 85, ry2 - 3, rx + 105, ry2);
    }
    ctx.stroke();

    // 4. Khóm hoa lục bình dập dềnh trên sông (Water Hyacinths)
    const hyacinthLoop = 380;
    const hyacinthShift = (offset * 0.85) % hyacinthLoop;
    for (let x = -hyacinthLoop; x < width + hyacinthLoop; x += hyacinthLoop) {
      const hx = x - hyacinthShift + 60;
      const hy = groundY - 24 + Math.sin(now * 0.003 + hx * 0.01) * 3;

      // Lá lục bình tròn mọng nước
      ctx.fillStyle = '#3f7c52';
      ctx.beginPath();
      ctx.ellipse(hx - 10, hy + 2, 9, 5, -0.2, 0, Math.PI * 2);
      ctx.ellipse(hx + 10, hy + 2, 9, 5, 0.2, 0, Math.PI * 2);
      ctx.ellipse(hx, hy + 4, 11, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hoa lục bình tím nhạt mộng mơ
      ctx.fillStyle = '#cbafdf'; // Tím phớt dịu
      ctx.beginPath();
      ctx.ellipse(hx - 3, hy - 4, 4, 7, -0.3, 0, Math.PI * 2);
      ctx.ellipse(hx + 3, hy - 4, 4, 7, 0.3, 0, Math.PI * 2);
      ctx.ellipse(hx, hy - 6, 4, 7.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Chấm nhụy vàng li ti
      ctx.fillStyle = '#ffe880';
      ctx.beginPath();
      ctx.arc(hx, hy - 5, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** 5. Trung cảnh Làng Quê & Bờ Sông miền Tây thuần Việt (Cây dừa, nhà tranh, bến đò, xuồng ba lá) */
  private drawCozyVillageMidground(width: number, groundY: number, offset: number, now: number): void {
    const ctx = this.ctx;
    const midLoop = 1350; // Chu kỳ cụm làng quê mộc mạc
    const baseOffset = offset % midLoop;

    for (let k = -1; k <= Math.ceil(width / midLoop) + 1; k++) {
      const ox = k * midLoop - baseOffset;

      // 0. LÙM CÂY XANH / RẶNG TRE PHÍA SAU (Lush Background Foliage)
      ctx.fillStyle = '#427550';
      ctx.beginPath();
      ctx.arc(ox + 160, groundY - 42, 54, 0, Math.PI * 2);
      ctx.arc(ox + 220, groundY - 58, 70, 0, Math.PI * 2);
      ctx.arc(ox + 310, groundY - 48, 58, 0, Math.PI * 2);
      ctx.arc(ox + 580, groundY - 52, 64, 0, Math.PI * 2);
      ctx.arc(ox + 670, groundY - 64, 76, 0, Math.PI * 2);
      ctx.arc(ox + 760, groundY - 46, 56, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#568e64';
      ctx.beginPath();
      ctx.arc(ox + 190, groundY - 38, 44, 0, Math.PI * 2);
      ctx.arc(ox + 625, groundY - 44, 52, 0, Math.PI * 2);
      ctx.arc(ox + 715, groundY - 40, 46, 0, Math.PI * 2);
      ctx.fill();

      // 1. CỤM BỤI CHUỐI XANH MÁT (Banana Grove)
      this.drawBananaGrove(ox + 80, groundY - 16);

      // 2. CÂY DỪA NGHIÊNG BÓNG (Leaning Coconut Tree)
      this.drawCoconutTree(ox + 210, groundY - 14, 1.0, 0.45);

      // 3. HÀNG RÀO TRE MỘC MẠC (Bamboo Fence)
      this.drawBambooFence(ox + 280, groundY - 10, 140);

      // 4. CHÁI NHÀ TRANH MÁI RẠ LÀNG THÚ (Cozy Thatched Cottage)
      this.drawThatchedCottage(ox + 470, groundY - 8);

      // 5. CÂY DỪA THỨ HAI BÊN CHÁI NHÀ
      this.drawCoconutTree(ox + 680, groundY - 14, 0.88, -0.3);

      // 6. CẦU KHỈ / CẦU GỖ BẾN ĐÒ (Rustic Pier / Monkey Bridge)
      this.drawWoodenPier(ox + 790, groundY - 10);

      // 7. CHIẾC XUỒNG BA LÁ MỘC MẠC DẬP DỀNH (Sampan Boat)
      this.drawSampanBoat(ox + 920, groundY - 12, now);

      // 8. HÀNG RÀO TRE NỐI TIẾP
      this.drawBambooFence(ox + 1040, groundY - 10, 120);

      // 9. CÂY DỪA THỨ BA CHE BÓNG MÁT
      this.drawCoconutTree(ox + 1200, groundY - 14, 0.95, 0.35);
    }
  }

  /** Vẽ Cây dừa nghiêng bóng thanh thoát phong cách Ghibli */
  private drawCoconutTree(x: number, y: number, scale: number, lean: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const trunkHeight = 150;
    const topX = lean * 65;
    const topY = -trunkHeight;

    // Thân dừa cong tự nhiên (gốc to, ngọn thon)
    ctx.strokeStyle = '#5a4b3b'; // Nâu xám mộc
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(lean * 25, -trunkHeight * 0.5, topX, topY);
    ctx.stroke();

    // Các sọc khoanh thân dừa
    ctx.strokeStyle = '#45382a';
    ctx.lineWidth = 1.8;
    for (let t = 0.15; t < 0.95; t += 0.08) {
      const qx = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * (lean * 25) + t * t * topX;
      const qy = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * (-trunkHeight * 0.5) + t * t * topY;
      ctx.beginPath();
      ctx.moveTo(qx - 5, qy);
      ctx.lineTo(qx + 5, qy);
      ctx.stroke();
    }

    // Chùm quả dừa xiêm xanh non dưới nách lá
    ctx.fillStyle = '#659656';
    ctx.beginPath();
    ctx.arc(topX - 5, topY + 6, 5.5, 0, Math.PI * 2);
    ctx.arc(topX + 4, topY + 7, 6, 0, Math.PI * 2);
    ctx.arc(topX - 1, topY + 13, 5, 0, Math.PI * 2);
    ctx.fill();

    // Tàu lá dừa tỏa vòm cung mềm mại hình cánh lá mượt mà
    const fronds = [
      { angle: -2.3, length: 76, arc: -20 },
      { angle: -1.7, length: 88, arc: -24 },
      { angle: -1.0, length: 94, arc: -26 },
      { angle: -0.4, length: 86, arc: -22 },
      { angle: 0.2, length: 80, arc: -18 },
      { angle: 0.8, length: 72, arc: -14 },
      { angle: -2.8, length: 68, arc: -14 },
    ];

    for (const fr of fronds) {
      ctx.save();
      ctx.translate(topX, topY);
      ctx.rotate(fr.angle);

      // Tàu lá dừa chính (dày dặn, vuốt nhọn về đuôi)
      ctx.fillStyle = '#3f7047';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(fr.length * 0.45, fr.arc - 13, fr.length, 0);
      ctx.quadraticCurveTo(fr.length * 0.55, fr.arc + 9, 0, 0);
      ctx.fill();

      // Mảng lá non sáng màu phía trên (soft light highlight)
      ctx.fillStyle = '#5e9668';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(fr.length * 0.45, fr.arc - 9, fr.length * 0.85, fr.arc * 0.5);
      ctx.quadraticCurveTo(fr.length * 0.5, fr.arc, 0, 0);
      ctx.fill();

      // Cuống sống lá dừa
      ctx.strokeStyle = '#295031';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(fr.length * 0.5, fr.arc, fr.length, 0);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  /** Vẽ Bụi chuối bờ sông mát rượi */
  private drawBananaGrove(x: number, y: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    const leaves = [
      { angle: -0.6, len: 48, w: 16, color: '#4a8240' },
      { angle: -0.2, len: 54, w: 18, color: '#629e54' },
      { angle: 0.35, len: 50, w: 16, color: '#569249' },
      { angle: 0.85, len: 42, w: 14, color: '#3f7336' },
      { angle: -1.1, len: 38, w: 13, color: '#386a30' },
    ];

    for (const lf of leaves) {
      ctx.save();
      ctx.rotate(lf.angle);
      ctx.fillStyle = lf.color;
      ctx.beginPath();
      ctx.ellipse(lf.len * 0.5, 0, lf.len * 0.5, lf.w * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gân lá chuối
      ctx.strokeStyle = '#2d5a26';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(lf.len, 0);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  /** Vẽ Chái nhà tranh vách nứa Làng Thú mộc mạc */
  private drawThatchedCottage(x: number, y: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // 1. Nền nhà & Vách nứa tre (Wood/Bamboo Wall)
    const wallW = 115;
    const wallH = 68;
    const wallX = -wallW / 2;
    const wallY = -wallH;

    ctx.fillStyle = '#7a624b'; // Nâu nứa mộc
    ctx.fillRect(wallX, wallY, wallW, wallH);

    // Vân vách nứa đan
    ctx.strokeStyle = '#68513d';
    ctx.lineWidth = 1.5;
    for (let bx = wallX + 10; bx < wallX + wallW; bx += 10) {
      ctx.beginPath();
      ctx.moveTo(bx, wallY);
      ctx.lineTo(bx, wallY + wallH);
      ctx.stroke();
    }

    // 2. Cửa ra vào mộc mạc & Cửa sổ đón gió mát
    ctx.fillStyle = '#483829';
    ctx.fillRect(wallX + 16, wallY + 18, 26, 50); // Cửa chính
    ctx.fillRect(wallX + 62, wallY + 18, 30, 24); // Cửa sổ

    // Mành liếp tre cuộn hé mở trên cửa sổ
    ctx.fillStyle = '#a48965';
    ctx.fillRect(wallX + 60, wallY + 15, 34, 7);

    // Cột gỗ chống hiên nhà
    ctx.fillStyle = '#574230';
    ctx.fillRect(wallX + 2, wallY, 5, wallH);
    ctx.fillRect(wallX + wallW - 7, wallY, 5, wallH);

    // 3. Mái tranh xếp tầng màu rơm khô tự nhiên (Thatched Roof - Không chói vàng)
    const roofOverhang = 24;
    const roofBaseY = wallY + 2;
    const roofPeakY = roofBaseY - 50;

    // Tầng mái hiên
    ctx.fillStyle = '#a68c67';
    ctx.beginPath();
    ctx.moveTo(wallX - roofOverhang, roofBaseY + 6);
    ctx.quadraticCurveTo(0, roofBaseY - 10, wallX + wallW + roofOverhang, roofBaseY + 6);
    ctx.lineTo(wallX + wallW + roofOverhang - 6, roofBaseY - 14);
    ctx.quadraticCurveTo(0, roofBaseY - 24, wallX - roofOverhang + 6, roofBaseY - 14);
    ctx.closePath();
    ctx.fill();

    // Mái chính hình vòm rơm rạ
    ctx.fillStyle = '#c5ac86'; // Màu be rơm khô ấm dịu
    ctx.beginPath();
    ctx.moveTo(wallX - roofOverhang, roofBaseY);
    ctx.quadraticCurveTo(wallX * 0.5, roofPeakY + 12, 0, roofPeakY);
    ctx.quadraticCurveTo((wallX + wallW) * 0.5, roofPeakY + 12, wallX + wallW + roofOverhang, roofBaseY);
    ctx.quadraticCurveTo(0, roofBaseY - 6, wallX - roofOverhang, roofBaseY);
    ctx.fill();

    // Viền rơm rạ rủ mềm tự nhiên ở mép mái
    ctx.fillStyle = '#ad926d';
    ctx.beginPath();
    ctx.moveTo(wallX - roofOverhang - 4, roofBaseY);
    for (let rx = wallX - roofOverhang; rx <= wallX + wallW + roofOverhang; rx += 9) {
      ctx.lineTo(rx + 4.5, roofBaseY + 7);
      ctx.lineTo(rx + 9, roofBaseY);
    }
    ctx.lineTo(wallX + wallW + roofOverhang + 4, roofBaseY);
    ctx.fill();

    // Lớp sống nóc rơm rạ
    ctx.strokeStyle = '#8f7653';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-20, roofPeakY + 1);
    ctx.lineTo(20, roofPeakY + 1);
    ctx.stroke();

    // Chậu hoa cúc vàng xinh xắn bên hiên nhà
    ctx.fillStyle = '#9e5a35';
    ctx.fillRect(wallX + 46, -12, 10, 10);
    ctx.fillStyle = '#ffd654';
    ctx.beginPath();
    ctx.arc(wallX + 51, -15, 6, 0, Math.PI * 2);
    ctx.fill();

    // 4. Lu sành / Chum đất nung hứng nước mưa bên chái nhà (đặc trưng miền Tây)
    const jarX = wallX + wallW + 12;
    const jarY = -22;
    ctx.fillStyle = '#874d35'; // Màu gốm đất nung mộc
    ctx.beginPath();
    ctx.ellipse(jarX, jarY, 9, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    // Nắp lu tròn bằng gỗ
    ctx.fillStyle = '#5f4631';
    ctx.fillRect(jarX - 7, jarY - 14, 14, 4);

    ctx.restore();
  }

  /** Vẽ Cầu khỉ / Cầu gỗ bến sông */
  private drawWoodenPier(x: number, y: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Cọc tre/gỗ cắm xiên xuống nước
    ctx.fillStyle = '#56422d';
    ctx.fillRect(-22, -18, 5, 24);
    ctx.fillRect(2, -22, 5, 28);
    ctx.fillRect(24, -16, 5, 22);

    // Ván cầu gỗ mộc bắc ra mép nước
    ctx.fillStyle = '#7a6247';
    ctx.fillRect(-32, -20, 68, 6);

    ctx.restore();
  }

  /** Vẽ Chiếc xuồng ba lá mộc mạc dập dềnh trên sóng nước */
  private drawSampanBoat(x: number, y: number, now: number): void {
    const ctx = this.ctx;
    ctx.save();

    // Dập dềnh bồng bềnh êm dịu theo nhịp sóng
    const bobY = Math.sin(now * 0.003 + x * 0.01) * 3;
    ctx.translate(x, y + bobY);

    // Thân xuồng gỗ vuốt nhọn 2 đầu
    ctx.fillStyle = '#63442a'; // Nâu gỗ mộc
    ctx.beginPath();
    ctx.moveTo(-36, -6);
    ctx.quadraticCurveTo(0, 10, 36, -6);
    ctx.quadraticCurveTo(0, 0, -36, -6);
    ctx.fill();

    // Mui vòm đan nan tre cong mộc mạc
    ctx.fillStyle = '#9e8159';
    ctx.beginPath();
    ctx.arc(2, -8, 14, Math.PI, 0);
    ctx.fill();

    // Mái chèo gác nghiêng bên mạn thuyền
    ctx.strokeStyle = '#543b25';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-18, -12);
    ctx.lineTo(16, 6);
    ctx.stroke();

    ctx.restore();
  }

  /** Vẽ Hàng rào tre mộc mạc */
  private drawBambooFence(x: number, y: number, length: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Nan tre cắm dọc
    ctx.fillStyle = '#8a704e';
    for (let fx = 0; fx < length; fx += 16) {
      const h = 24 + (fx % 3) * 4;
      ctx.fillRect(fx, -h, 3.5, h);
    }

    // Thanh tre giằng ngang
    ctx.fillRect(0, -18, length, 3);
    ctx.fillRect(0, -8, length, 3);

    ctx.restore();
  }

  /** 6. Tiền cảnh con đường cỏ hoa platformer & nền đất phù sa màu mỡ */
  private drawCozyForegroundTrail(width: number, groundY: number, height: number, offset: number): void {
    const ctx = this.ctx;

    // 1. NỀN ĐẤT PHÙ SA MÀU MỠ (Fertile Earth Base)
    // Kéo dài xuống tận đáy màn hình không bao giờ bị cắt
    const earthGrad = ctx.createLinearGradient(0, groundY + 10, 0, height);
    earthGrad.addColorStop(0, '#734827'); // Nâu phù sa ấm cúng tự nhiên
    earthGrad.addColorStop(0.35, '#583216'); // Nâu đất sâu
    earthGrad.addColorStop(1, '#3a1e0b'); // Nâu đất thẫm đáy
    ctx.fillStyle = earthGrad;
    ctx.fillRect(0, groundY + 10, width, Math.max(height - groundY - 10, 80));

    // Các viên sỏi nhỏ mộc mạc rải rác trong lòng đất
    ctx.fillStyle = '#8f7b66';
    const pebbleSpacing = 120;
    const pebbleShift = (offset * 1.0) % pebbleSpacing;
    for (let x = -pebbleSpacing; x < width + pebbleSpacing; x += pebbleSpacing) {
      const px = x - pebbleShift;
      ctx.beginPath();
      ctx.ellipse(px + 24, groundY + 28, 5, 3.2, 0.2, 0, Math.PI * 2);
      ctx.ellipse(px + 78, groundY + 45, 6, 3.8, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. DẢI CỎ XANH TƯƠI MÁT LÀNH (Lớp nền cỏ dày 14px)
    const grassGrad = ctx.createLinearGradient(0, groundY - 6, 0, groundY + 12);
    grassGrad.addColorStop(0, '#66a84c'); // Xanh mướt tươi mát
    grassGrad.addColorStop(1, '#4e8d38'); // Xanh rêu đậm mộc
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, groundY - 6, width, 18);

    // 3. TỪNG TÉP CỎ NHỌN MỀM MẠI NHÔ LÊN (Tufts of soft grass)
    ctx.fillStyle = '#7ebd5e';
    ctx.beginPath();
    const tuftSpacing = 28;
    const tuftShift = (offset * 1.0) % tuftSpacing;
    for (let x = -tuftSpacing; x < width + tuftSpacing; x += tuftSpacing) {
      const gx = x - tuftShift;
      ctx.moveTo(gx, groundY - 6);
      ctx.lineTo(gx + 5, groundY - 18);
      ctx.lineTo(gx + 9, groundY - 6);
      ctx.moveTo(gx + 7, groundY - 6);
      ctx.lineTo(gx + 14, groundY - 21);
      ctx.lineTo(gx + 18, groundY - 6);
    }
    ctx.fill();

    // 4. HOA CÚC DẠI TRẮNG TINH KHÔI & HOA TÍM DỌC ĐƯỜNG
    const flowerSpacing = 140;
    const flowerShift = (offset * 1.0) % flowerSpacing;
    for (let x = -flowerSpacing; x < width + flowerSpacing; x += flowerSpacing) {
      const fx = x - flowerShift;
      const fy = groundY - 4;

      // Cụm 1: Hoa cúc trắng nhụy vàng
      ctx.fillStyle = '#ffffff';
      for (let p = 0; p < 5; p++) {
        const ang = (p * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(fx + Math.cos(ang) * 4.5, fy + Math.sin(ang) * 4.5, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffd859';
      ctx.beginPath();
      ctx.arc(fx, fy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Cụm 2: Hoa dại tím li ti
      ctx.fillStyle = '#c8aee2';
      ctx.beginPath();
      ctx.arc(fx + 55, fy - 6, 3, 0, Math.PI * 2);
      ctx.arc(fx + 61, fy - 8, 3.2, 0, Math.PI * 2);
      ctx.arc(fx + 67, fy - 5, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** 7. Render 3 nhân vật hành quân tiến bước nhịp nhàng */
  private drawCharacters(width: number, groundY: number, now: number, isPortrait: boolean): void {
    const ctx = this.ctx;
    if (this.characters.length === 0) return;

    // Căn giữa nhóm 3 nhân vật trên màn hình
    const spacing = isPortrait ? 96 : 130;
    const groupWidth = (this.characters.length - 1) * spacing;
    const startX = Math.round((width - groupWidth) / 2);

    const FPS = 8.5; // Nhịp bước chân vui nhộn 8.5 FPS

    this.characters.forEach((char, index) => {
      const charX = startX + index * spacing;
      const charY = groundY;

      // 1. Bóng đổ dưới chân (Soft Chibi Drop Shadow)
      const shadowAnim = Math.sin(now * 0.001 * FPS * Math.PI + char.phaseOffset * Math.PI);
      const shadowW = char.targetHeight * 0.42 + shadowAnim * 3;
      const shadowH = 10 + shadowAnim * 1.5;

      ctx.fillStyle = 'rgba(56, 44, 26, 0.28)';
      ctx.beginPath();
      ctx.ellipse(charX, charY + 2, shadowW, shadowH, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Tính frame animation theo thời gian
      const totalFrames = char.frames.length;
      if (totalFrames === 0) return;

      const frameIndex = Math.floor((now / 1000 + char.phaseOffset) * FPS) % totalFrames;
      const f = char.frames[frameIndex];
      if (!f) return;

      // Tính tỷ lệ hiển thị dựa trên bodyHeight chuẩn
      const baseHeight = char.frames[0]?.bodyHeight || 350;
      const scale = char.targetHeight / baseHeight;

      const destW = f.width * scale;
      const destH = f.height * scale;
      const destX = charX - destW / 2;
      const destY = charY - f.groundY * scale;

      // Vẽ sprite quay mặt về bên phải (hướng hành quân)
      ctx.drawImage(char.image, f.x, f.y, f.width, f.height, destX, destY, destW, destH);
    });
  }

  /** 8. Bụi hoa cúc dại tiền cảnh đung đưa lướt qua trước chân */
  private drawFrontFoliage(width: number, groundY: number, offset: number): void {
    const ctx = this.ctx;
    const flowerSpacing = 190;
    const flowerShift = offset % flowerSpacing;

    for (let x = -flowerSpacing; x < width + flowerSpacing; x += flowerSpacing) {
      const fx = x - flowerShift + 40;
      const fy = groundY - 2;

      // Hoa cúc trắng nhỏ lướt qua trước chân
      ctx.fillStyle = '#ffffff';
      for (let p = 0; p < 5; p++) {
        const ang = (p * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(fx + Math.cos(ang) * 4.5, fy + Math.sin(ang) * 4.5, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      // Nhụy vàng tươi
      ctx.fillStyle = '#ffda5e';
      ctx.beginPath();
      ctx.arc(fx, fy, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** 9. Vẽ lá bay & cánh hoa nhẹ nhàng lơ lửng */
  private drawLeaves(): void {
    const ctx = this.ctx;
    for (const leaf of this.leaves) {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rotation);
      ctx.fillStyle = leaf.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.size, leaf.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  public destroy(): void {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.handleResize);
    this.canvas.remove();
  }
}
