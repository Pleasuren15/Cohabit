import React, { useState, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionTemplate,
  type PanInfo,
} from 'motion/react';
import {
  ArrowUpRight,
  ShoppingCart,
  Users,
  CreditCard,
  BarChart3,
} from 'lucide-react';
import { FaArrowUpLong } from 'react-icons/fa6';

export interface CardData {
  id: number;
  icon: React.ElementType;
  percentage: string;
  value: string;
  label: string;
  gradient?: string;
}

const DEFAULT_CARDS: CardData[] = [
  {
    id: 0,
    icon: CreditCard,
    percentage: '2.15%',
    value: '$2,374',
    label: 'Weekly Expense',
  },
  {
    id: 1,
    icon: ShoppingCart,
    percentage: '1.20%',
    value: '$1,589',
    label: 'Weekly Orders',
  },
  {
    id: 2,
    icon: Users,
    percentage: '2.33%',
    value: '$976',
    label: 'Weekly Users',
  },
  {
    id: 3,
    icon: BarChart3,
    percentage: '3.82%',
    value: '$46,748',
    label: 'Weekly Sales',
  },
];

const DRAG_BUFFER = 60;
const VELOCITY_THRESHOLD = 500;

const WigglingCard = ({ card, i, x, cardWidth, gap }: { card: CardData; i: number; x: import('motion/react').MotionValue<number>; cardWidth: number; gap: number }) => {
  const Icon = card.icon;
  const center = -(i * (cardWidth + gap));

  const distance = useTransform(x, (v: number) => v - center);

  const rotate = useTransform(
    distance,
    [-cardWidth, -cardWidth * 0.1, 0, cardWidth * 0.1, cardWidth],
    [10, 10, 0, -10, -10],
  );

  const blur = useTransform(
    distance,
    [-cardWidth, -cardWidth * 0.2, 0, cardWidth * 0.2, cardWidth],
    [4, 2, 0, 2, 4],
  );

  const opacity = useTransform(
    distance,
    [-cardWidth, -cardWidth * 0.2, 0, cardWidth * 0.2, cardWidth],
    [0, 0.8, 1, 0.8, 0],
  );

  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.div
      key={card.id}
      style={{
        opacity,
        rotate,
        filter,
        minWidth: cardWidth,
      }}
      className={`relative flex h-36 flex-col justify-between rounded-[24px] border border-white/20 p-3 text-white sm:h-44 sm:rounded-[28px] sm:p-4 ${card.gradient ?? "bg-white dark:bg-neutral-900"}`}
    >
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm sm:h-12 sm:w-12">
          <Icon
            className="h-5 w-5 text-white sm:h-7 sm:w-7"
            strokeWidth={1.5}
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex w-fit items-center rounded-xl bg-white/20 backdrop-blur-sm px-2 py-0.5 text-xs font-medium text-white/90 sm:text-sm">
            <FaArrowUpLong className="mr-1 h-2.5 w-2.5" />
            {card.percentage}
          </div>

          <h2 className="text-xl font-bold text-white sm:text-2xl">
            {card.value}
          </h2>

          <p className="text-xs font-medium text-white/70 sm:text-sm">
            {card.label}
          </p>
        </div>
      </div>

      <div className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:h-7 sm:w-7">
          <ArrowUpRight className="h-3 w-3 text-white sm:h-4 sm:w-4" />
        </div>
      </div>
    </motion.div>
  );
};

export function WigglingCards({ cards }: { cards?: CardData[] }) {
  const data = cards ?? DEFAULT_CARDS;
  const [index, setIndex] = useState(1);
  const [dimensions, setDimensions] = useState({ cardWidth: 320, gap: 200 });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDimensions({
          cardWidth: Math.min(width - 64, 300),
          gap: 40,
        });
      } else {
        setDimensions({
          cardWidth: 320,
          gap: 200,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { cardWidth, gap } = dimensions;
  const x = useMotionValue(-(index * (cardWidth + gap)));

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      setIndex((prev) => Math.min(prev + 1, data.length - 1));
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      setIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <div className="flex flex-col items-center py-4">
      <div style={{ width: cardWidth + 40 }} className="relative">
        <motion.div
          className="flex touch-pan-y"
          drag="x"
          dragConstraints={{
            left: -(data.length - 1) * (cardWidth + gap),
            right: 0,
          }}
          style={{
            x,
            gap: `${gap}px`,
            perspective: 1000,
          }}
          animate={{
            x: -(index * (cardWidth + gap)),
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 40,
          }}
          onDragEnd={handleDragEnd}
        >
          {data.map((card, i) => (
            <WigglingCard
              key={card.id}
              card={card}
              i={i}
              x={x}
              cardWidth={cardWidth}
              gap={gap}
            />
          ))}
        </motion.div>
      </div>

      <div className="mt-3 flex gap-2">
        {data.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-3 w-3 rounded-full transition-colors duration-200 ease-out ${
              i === index
                ? 'bg-neutral-500 dark:bg-neutral-400'
                : 'bg-neutral-300 dark:bg-neutral-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
