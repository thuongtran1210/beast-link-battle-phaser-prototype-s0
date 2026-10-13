const params = new URLSearchParams(location.search), animation = params.get('tab') === 'animation' && ['beast-a', 'beast-c', 'beast-e'].includes(params.get('unit') ?? '');
document.querySelector('#character-studio')!.id = animation ? 'animation-studio' : 'unit-editor';
if (animation)
    void import('../AnimationStudio');
else
    void import('../UnitEditor');
export {};
