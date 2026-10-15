export const R2_AVATARS_BASE_URL = 'https://pub-8d569d923b41447ba0ac57f09f8b39ba.r2.dev/nimu-academy/avatar/cream';

export interface AvatarItem {
  id: string;
  name: string;
  url: string;
  localUrl: string;
}

export const AVATAR_LIST: AvatarItem[] = Array.from({ length: 20 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  const filename = `avatar-${num}.svg`;
  return {
    id: filename,
    name: `Avatar ${i + 1}`,
    url: `${R2_AVATARS_BASE_URL}/${filename}`,
    localUrl: `/cream/${filename}`,
  };
});

export const DEFAULT_AVATAR = `${R2_AVATARS_BASE_URL}/avatar-01.svg`;
