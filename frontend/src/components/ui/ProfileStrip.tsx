import { useState } from 'react';

export type ProfileSection = 'films' | 'diary' | 'watchlist' | 'lists';

interface ProfileStripProps {
  profileName: string;
  profileSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
  onProfileNameChange: (name: string) => void;
}

export function ProfileStrip({
  profileName,
  profileSection,
  onSectionChange,
  onProfileNameChange,
}: ProfileStripProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(profileName);

  const saveName = () => {
    const nextName = draftName.trim();
    if (nextName) {
      onProfileNameChange(nextName);
      setDraftName(nextName);
      setIsEditing(false);
    }
  };

  return (
    <section className="profile-strip">
      <div className="profile-avatar">{profileName.charAt(0).toUpperCase()}</div>
      <div className="profile-info">
        {isEditing ? (
          <div className="profile-editor">
            <input
              className="profile-name-input"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && saveName()}
              aria-label="Nome do perfil"
              autoFocus
            />
            <button type="button" className="secondary-button profile-save-button" onClick={saveName}>
              Salvar
            </button>
          </div>
        ) : (
          <>
            <span className="profile-name">{profileName}</span>
            <button type="button" className="ghost-button profile-edit-button" onClick={() => setIsEditing(true)}>
              Editar
            </button>
          </>
        )}
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
            className={profileSection === 'watchlist' ? 'tab-button tab-active' : 'tab-button'}
            onClick={() => onSectionChange('watchlist')}
          >
            Watchlist
          </button>
          <button
            type="button"
            className={profileSection === 'lists' ? 'tab-button tab-active' : 'tab-button'}
            onClick={() => onSectionChange('lists')}
          >
            Lists
          </button>
        </div>

      </div>
    </section>
  );
}
