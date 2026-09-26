export type ProfileSection = 'films' | 'diary' | 'reviews' | 'lists';
export type FilmFilter = 'watched' | 'all';

interface ProfileStripProps {
  profileSection: ProfileSection;
  filmFilter: FilmFilter;
  onSectionChange: (section: ProfileSection) => void;
  onFilmFilterChange: (filter: FilmFilter) => void;
}

export function ProfileStrip({
  profileSection,
  filmFilter,
  onSectionChange,
  onFilmFilterChange,
}: ProfileStripProps) {
  return (
    <section className="profile-strip">
      <div className="profile-avatar">S</div>
      <div className="profile-info">
        <span className="profile-name">Seu perfil</span>
      </div>

      <div className="profile-nav" aria-label="Tab de navegação do perfil">
        <div className="profile-main-tabs">
          <button
            type="button"
            className={profileSection === 'films' ? 'tab-button tab-active' : 'tab-button'}
            onClick={() => onSectionChange('films')}
          >
            Films
          </button>
          <button
            type="button"
            className={profileSection === 'diary' ? 'tab-button tab-active' : 'tab-button'}
            onClick={() => onSectionChange('diary')}
          >
            Diary
          </button>
          <button
            type="button"
            className={profileSection === 'reviews' ? 'tab-button tab-active' : 'tab-button'}
            onClick={() => onSectionChange('reviews')}
          >
            Reviews
          </button>
          <button
            type="button"
            className={profileSection === 'lists' ? 'tab-button tab-active' : 'tab-button'}
            onClick={() => onSectionChange('lists')}
          >
            Lists
          </button>
        </div>

        {profileSection === 'films' && (
          <div className="profile-subtabs" aria-label="Filtro de filmes assistidos">
            <button
              type="button"
              className={filmFilter === 'watched' ? 'subtab-button subtab-active' : 'subtab-button'}
              onClick={() => onFilmFilterChange('watched')}
            >
              Assistidos
            </button>
            <button
              type="button"
              className={filmFilter === 'all' ? 'subtab-button subtab-active' : 'subtab-button'}
              onClick={() => onFilmFilterChange('all')}
            >
              Todos
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
