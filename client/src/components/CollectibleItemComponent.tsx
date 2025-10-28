import { CollectibleItem } from '@shared/schema';
import cheeseImage from '@assets/generated_images/Yellow_cheese_game_item_8dd92be1.png';
import appleImage from '@assets/generated_images/Red_apple_game_item_b556ba8e.png';
import breadImage from '@assets/generated_images/Bread_loaf_game_item_335458bc.png';

interface CollectibleItemComponentProps {
  item: CollectibleItem;
  isHovered?: boolean;
}

const ITEM_IMAGES = {
  'cheese-small': cheeseImage,
  'cheese-medium': cheeseImage,
  'apple': appleImage,
  'bread': breadImage,
};

const ITEM_SIZES = {
  'cheese-small': 'w-12 h-12',
  'cheese-medium': 'w-16 h-16',
  'apple': 'w-14 h-14',
  'bread': 'w-14 h-14',
};

export function CollectibleItemComponent({ item, isHovered }: CollectibleItemComponentProps) {
  const image = ITEM_IMAGES[item.type];
  const sizeClass = ITEM_SIZES[item.type];

  return (
    <div
      data-testid={`item-${item.id}`}
      className="absolute transition-all duration-200"
      style={{
        left: `${item.position.x}px`,
        top: `${item.position.y}px`,
        transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.15)' : 'scale(1)'}`,
      }}
    >
      <div className={`relative ${isHovered ? 'animate-pulse' : ''}`}>
        <img
          src={image}
          alt={item.type}
          className={`${sizeClass} object-contain drop-shadow-lg`}
        />
        {isHovered && (
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        )}
      </div>
    </div>
  );
}
