import { readCharacter, saveCharacter, diffSummary, type EditorState } from './CharacterApi';
export interface SavePanelOptions {
    id: () => string;
    section: 'unit' | 'animation';
    value: () => unknown;
    assets?: (value: unknown, id: string) => Promise<Record<string, unknown>>;
    assetSummary?: () => string | undefined;
    loaded?: (state: EditorState) => void;
    restored: (state: EditorState) => void;
    notify: (text: string, error?: boolean) => void;
    saved?: (state: EditorState) => void;
    working?: (busy: boolean) => void;
}
/** Shared save workflow; deliberately retains working edits when validation/save fails. */
export class StudioSavePanel {
    private state: EditorState | undefined;
    private busy = false;
    private epoch = 0;
    private save = document.createElement('button');
    private reload = document.createElement('button');
    private current = document.createElement('button');
    private versions = document.createElement('select');
    private restore = document.createElement('button');
    private dialog = document.createElement('dialog');
    constructor(host: HTMLElement, private options: SavePanelOptions) {
        host.classList.add('studio-project-save');
        this.save.textContent = 'Xem thay đổi & lưu';
        this.reload.textContent = 'Đọc lại revision';
        this.current.textContent = 'Mở bản đã lưu';
        this.restore.textContent = 'Khôi phục phiên bản';
        this.versions.setAttribute('aria-label', 'Phiên bản sao lưu nhân vật');
        host.append(this.save, this.reload, this.current, this.versions, this.restore);
        document.body.append(this.dialog);
        this.save.onclick = () => this.review();
        this.reload.onclick = () => void this.load(false);
        this.current.onclick = () => this.confirm('Mở bản đã lưu trong dự án',['Thay chỉnh sửa trên form/bản nháp bằng cấu hình đang lưu của Beast này.','Ảnh nguồn và file dự án không bị thay đổi.'],async()=>{
            this.disable(true);
            try{this.state=await readCharacter(this.options.id());this.history();this.options.restored(this.state);this.options.notify('Đã mở bản đang lưu trong dự án.');}
            catch(error){this.options.notify((error as Error).message,true);}
            finally{this.disable(false);}
        },'Mở bản đã lưu');
        this.restore.onclick = () => this.reviewRestore();
        void this.load(true);
    }
    async load(initial = false) { const epoch = ++this.epoch; this.disable(true); try {
        const state = await readCharacter(this.options.id());
        if (epoch !== this.epoch)
            return;
        this.state = state;
        this.history();
        if (initial)
            this.options.loaded?.(state);
        else
            this.options.notify('Đã đọc revision mới; chỉnh sửa trên form vẫn được giữ. Xem thay đổi trước khi lưu.');
    }
    catch (error) {
        this.state = undefined;
        this.options.notify((error as Error).message, true);
    }
    finally {
        if (epoch === this.epoch)
            this.disable(false);
    } }
    private history() { this.versions.replaceChildren(); const empty = document.createElement('option'); empty.value = ''; empty.textContent = 'Chọn bản sao lưu'; this.versions.append(empty); for (const name of this.state?.history ?? []) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = `Trước lần lưu ${new Date(Number(name.split('-')[0])).toLocaleString('vi-VN')}`;
        this.versions.append(option);
    } }
    private disable(value: boolean) { this.busy = value; this.options.working?.(value); this.save.disabled = value || !this.state; this.reload.disabled = value; this.current.disabled=value||!this.state; this.restore.disabled = value || !this.state; this.versions.disabled = value; }
    private confirm(title: string, lines: string[], action: () => Promise<void>,label='Lưu thay đổi') { this.dialog.replaceChildren(); const h = document.createElement('h2'); h.textContent = title; const list = document.createElement('ul'); for (const text of lines) {
        const li = document.createElement('li');
        li.textContent = text;
        list.append(li);
    } const cancel = document.createElement('button'); cancel.textContent = 'Hủy'; cancel.onclick = () => this.dialog.close(); const apply = document.createElement('button'); apply.textContent = label; apply.onclick = () => { this.dialog.close(); void action(); }; this.dialog.append(h, list, cancel, apply); this.dialog.showModal(); }
    private review() { if (this.busy || !this.state)
        return; try {
        const next = this.options.value(), before = this.state.record[this.options.section] ?? {};
        const lines = diffSummary(before, next), asset = this.options.assetSummary?.();
        this.confirm('Kiểm tra trước khi lưu', [...lines, ...(asset ? [asset] : []), 'Cấu hình cũ được sao lưu. Tải lại Review/game để áp dụng.'], () => this.write(next));
    }
    catch (error) {
        this.options.notify((error as Error).message, true);
    } }
    private async write(next: unknown) { if (!this.state)
        return; const id = this.options.id(), revision = this.state.revisions[this.options.section]; this.disable(true); this.options.notify('Đang kiểm tra ảnh và lưu cấu hình…'); try {
        const assets = await this.options.assets?.(next, id) ?? {};
        const state = await saveCharacter(id, this.options.section, next, revision, assets);
        this.state = state;
        this.history();
        this.options.saved?.(state);
        this.options.notify('Đã lưu vào dự án và sao lưu bản cũ. Tải lại Review/game để kiểm tra.');
    }
    catch (error) {
        this.options.notify(`${(error as Error).message} Bản chỉnh sửa vẫn được giữ.`, true);
    }
    finally {
        this.disable(false);
    } }
    private reviewRestore() { if (this.busy || !this.state || !this.versions.value)
        return; const historyId = this.versions.value; this.confirm('Khôi phục cấu hình nhân vật', ['Khôi phục cả avatar, thông số, kỹ năng và animation của Beast đang chọn.', 'Bản hiện tại được sao lưu trước khi khôi phục.'], async () => { this.disable(true); try {
        this.state = await saveCharacter(this.options.id(), 'restore', {}, this.state!.revisions.record, { historyId });
        this.history();
        this.options.restored(this.state);
        this.options.notify('Đã khôi phục phiên bản. Tải lại Review/game để áp dụng.');
    }
    catch (error) {
        this.options.notify((error as Error).message, true);
    }
    finally {
        this.disable(false);
    } }); }
}
