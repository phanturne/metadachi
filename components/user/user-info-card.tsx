import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserInfoCardProps {
  avatar?: string | null;
  name: string;
  email: string;
}

export function UserInfoCard({ avatar, name, email }: UserInfoCardProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Avatar className="size-8 rounded-lg">
        <AvatarImage src={avatar || ''} alt={name} />
        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{name || 'Guest'}</span>
        <span className="truncate text-xs">{email}</span>
      </div>
    </>
  );
}
