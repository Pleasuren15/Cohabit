import { useId } from 'react';

import { Label } from '@/components/ui/label';
import { PROVINCE_SHAPES } from '@/lib/province-shapes';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const provinces = [
  { id: 'ec', initials: 'EC', label: 'Eastern Cape' },
  { id: 'fs', initials: 'FS', label: 'Free State' },
  { id: 'gp', initials: 'GP', label: 'Gauteng' },
  { id: 'kzn', initials: 'KZN', label: 'KwaZulu-Natal' },
  { id: 'lp', initials: 'LP', label: 'Limpopo' },
  { id: 'mp', initials: 'MP', label: 'Mpumalanga' },
  { id: 'nc', initials: 'NC', label: 'Northern Cape' },
  { id: 'nw', initials: 'NW', label: 'North West' },
  { id: 'wc', initials: 'WC', label: 'Western Cape' },
];

interface Select33Props {
  onProvinceChange?: (province: string | null) => void;
}

const Select33 = ({ onProvinceChange }: Select33Props) => {
  const id = useId();

  return (
    <div className="w-full max-w-xs space-y-2">
      <Label
        htmlFor={id}
        className="justify-center text-center text-zinc-600 dark:text-zinc-400"
      >
        Which province are you looking in?
      </Label>
      <Select
        onValueChange={(value) => onProvinceChange?.(value)}
      >
        <SelectTrigger
          id={id}
          className="w-full rounded-xl border-zinc-200 bg-white shadow-xs transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 px-2"
        >
          <SelectValue placeholder="Select your province" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          className="rounded-xl border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
        >
          <SelectGroup>
            <SelectLabel className="text-zinc-500 text-xs px-2.5">
              South African Provinces
            </SelectLabel>
            {provinces.map((prov) => (
              <SelectItem
                key={prov.id}
                value={prov.id}
                className="rounded-lg"
              >
                <span className="flex items-center gap-2.5">
                  <img
                    src={PROVINCE_SHAPES[prov.id]}
                    alt=""
                    aria-hidden="true"
                    className="size-6 shrink-0 object-contain"
                  />
                  <span className="truncate">{prov.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <p className="text-[12px] text-center text-zinc-500 px-1 dark:text-zinc-500">
        Browse co-living spaces available in your chosen province.
      </p>
    </div>
  );
};

export default Select33;
