// BrunoVerse Avatar Helper
// Requirement 2 & 9:
// - If profile photo exists (Google profile image or uploaded image), always show actual profile image.
// - If gender == Male, show male avatar/icon.
// - If gender == Female, show female avatar/icon.
// - Otherwise, show gender-neutral animal lover avatar.

export const MALE_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";
export const FEMALE_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80";
export const NEUTRAL_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";

export function getUserAvatar(user) {
  if (!user) return NEUTRAL_AVATAR;

  // 1. Google profile image or uploaded image overrides generic avatar
  if (user.avatarUrl && typeof user.avatarUrl === 'string' && user.avatarUrl.trim().length > 0) {
    return user.avatarUrl;
  }

  // 2. Gender specific fallback
  const gender = (user.gender || '').toUpperCase();
  if (gender === 'MALE') {
    return MALE_AVATAR;
  }
  if (gender === 'FEMALE') {
    return FEMALE_AVATAR;
  }

  return NEUTRAL_AVATAR;
}

export function getGreeting(userName) {
  const name = userName ? userName.trim() : 'Friend';
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (hour >= 17) {
    timeGreeting = 'Good evening';
  }
  return `${timeGreeting}, ${name}`;
}
