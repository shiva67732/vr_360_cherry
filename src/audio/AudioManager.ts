type Sound = 'music'|'ambience'|'envelope'|'magic'|'ring'
const files: Record<Sound,string> = { music:'/audio/music.mp3', ambience:'/audio/ambience.mp3', envelope:'/audio/envelope.mp3', magic:'/audio/magic-whoosh.mp3', ring:'/audio/ring-chime.mp3' }
class Manager {
  private sounds = new Map<Sound, HTMLAudioElement>()
  init() { Object.entries(files).forEach(([k,src]) => { const a = new Audio(src); a.preload='none'; if(k==='music'||k==='ambience') a.loop=true; a.addEventListener('error',()=>{}, {once:true}); this.sounds.set(k as Sound,a) }) }
  play(name: Sound, volume=.6) { const a=this.sounds.get(name); if(!a)return; a.volume=volume; void a.play().catch(()=>{}) }
  stopAll() { this.sounds.forEach(a=>{a.pause();a.currentTime=0}) }
  mute(value:boolean) { this.sounds.forEach(a=>a.muted=value) }
}
export const audioManager = new Manager()
