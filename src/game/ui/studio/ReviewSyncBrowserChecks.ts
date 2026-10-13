import { refreshReview } from '../UnitReview';
import { readCharacter } from './CharacterApi';
import { updateCharacterRecord, characterRecord } from '../../config/CharacterProjects';
import { canonical, type CharacterId } from '../../config/CharacterSchema';
import { roleBaseStats } from '../../battle/AutonomousBattleModel';
import { roleForBeast } from '../../battle/BeastRoles';
const output = document.querySelector('#sync-results')!;
const delay = () => new Promise(resolve => setTimeout(resolve, 30));
try {
    const button = document.querySelector<HTMLButtonElement>('.review-refresh')!;
    for (let i = 0; button.disabled && i < 100; i++)
        await delay();
    const id = (new URLSearchParams(location.search).get('unit') ?? 'beast-a') as CharacterId, state = await readCharacter(id), old = JSON.parse(JSON.stringify(state.record));
    // Simulate an already-open tab holding stale module data. No project write.
    updateCharacterRecord(id, { ...old, unit: { ...old.unit, hp: 12345 } });
    await refreshReview(true);
    if (canonical(characterRecord(id)) !== canonical(state.record))
        throw Error('Review chưa thay cấu hình stale bằng bản API.');
    const hp = state.record.unit?.hp ?? roleBaseStats(roleForBeast(id)).hp;
    if (document.querySelector('.review-stats strong')!.textContent !== String(Number((hp * 1.8).toFixed(3))))
        throw Error('HP trên giao diện không phản ánh bản đã lưu.');
    const attack = [...document.querySelectorAll<HTMLButtonElement>('[data-clip]')].find(b => b.dataset.clip === 'attack')!;
    attack.click();
    for (let i = 0; i < 100 && !document.querySelector('.review-frames button'); i++)
        await delay();
    const fifth = document.querySelectorAll<HTMLButtonElement>('.review-frames button')[4];
    fifth.click();
    for (let i = 0; i < 100 && !document.querySelector('.frame-label')!.textContent!.includes('Frame 5/8'); i++)
        await delay();
    if (!document.querySelector('.frame-label')!.textContent!.includes('Frame 5/8'))
        throw Error('Review seek không giữ đúng frame 5.');
    output.textContent = 'PASS Review stale → bản API mới\nPASS HP hiển thị dùng dữ liệu đã lưu\nPASS chọn frame 5 giữ đúng pose\nDONE · không ghi cấu hình hoặc bản nháp.';
}
catch (error) {
    output.textContent = 'FAIL ' + (error as Error).message;
}
