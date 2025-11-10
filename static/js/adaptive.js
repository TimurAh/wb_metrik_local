    const baseWidth = 1920;
    const baseHeight = 1080;
    const baseDiagonal = Math.sqrt(baseWidth ** 2 + baseHeight ** 2);
    function scaleApp() {
      const app = document.getElementById('app');
      const w = window.innerWidth;
      const h = window.innerHeight;
      const currentDiagonal = Math.sqrt(w ** 2 + h ** 2);
      const scaleDiagonal = currentDiagonal / baseDiagonal;
      const scaleWidth = w / baseWidth;
      // Берём диагональный масштаб, нормализованный по ширине
      const scale = scaleDiagonal * (scaleWidth / scaleDiagonal);
      // Центрируем, чтобы при scale > 1 не было смещения
      const offsetX = (w - baseWidth * scale) / 2;
      app.style.transform = `translateX(${offsetX}px) scale(${scale})`;
    }
    window.addEventListener('resize', scaleApp);
    scaleApp();