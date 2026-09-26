type ProfileTab = 'watched' | 'all';

interface ProfileStripProps {
  profileTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export function ProfileStrip({ profileTab, onTabChange }: ProfileStripProps) {
  return (
    <section className="profile-strip">
      <div className="profile-avatar">S</div>
      <div className="profile-info">
        <span className="profile-name">Seu perfil</span>
      </div>

      <div className="profile-tabs" aria-label="Tab de navegação do perfil">
        <button
          type="button"
          className={profileTab === 'watched' ? 'tab-button tab-active' : 'tab-button'}
          onClick={() => onTabChange('watched')}
        >
          Assistidos
        </button>
        <button
          type="button"
          className={profileTab === 'all' ? 'tab-button tab-active' : 'tab-button'}
          onClick={() => onTabChange('all')}
        >
          Todos
        </button>
      </div>
    </section>
  );
}

export type { ProfileTab };
