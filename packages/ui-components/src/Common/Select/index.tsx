'use client';

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import * as SelectPrimitive from '@radix-ui/react-select';
import classNames from 'classnames';
import { useEffect, useId, useMemo, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

import Skeleton from '#ui/Common/Skeleton';
import type { FormattedMessage, LinkLike } from '#ui/types';
import { isStringArray, isValuesArray } from '#ui/util/array';

import styles from './index.module.css';

export type SelectValue<T extends string> = {
  label: FormattedMessage | string;
  value: T;
  iconImage?: ReactElement<SVGSVGElement>;
  disabled?: boolean;
};

export type SelectGroup<T extends string> = {
  label?: FormattedMessage | string;
  items: Array<SelectValue<T>>;
};

export type SelectProps<T extends string> = {
  values: Array<SelectGroup<T>> | Array<T> | Array<SelectValue<T>>;
  defaultValue?: T;
  placeholder?: string;
  label?: string;
  inline?: boolean;
  onChange?: (value: T) => void;
  className?: string;
  /**
   * Allows passing custom CSS classes to the dropdown container element.
   * This is useful for overriding default styles, such as adjusting `max-height`.
   * The dropdown is rendered within a `Portal`.
   */
  dropdownClassName?: string;
  ariaLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  fallbackClass?: string;
  as?: LinkLike | 'div';
};

const Select = <T extends string>({
  values = [],
  defaultValue,
  placeholder,
  label,
  inline,
  onChange,
  className,
  dropdownClassName,
  ariaLabel,
  loading = false,
  disabled = false,
  fallbackClass = '',
}: SelectProps<T>): ReactNode => {
  const id = useId();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => setValue(defaultValue), [defaultValue]);

  const mappedValues = useMemo(() => {
    let mappedValues = values;

    if (isStringArray(mappedValues)) {
      mappedValues = mappedValues.map(value => ({
        label: value,
        value: value,
      }));
    }

    if (isValuesArray(mappedValues)) {
      return [{ items: mappedValues }];
    }

    return mappedValues;
  }, [values]) as Array<SelectGroup<T>>;

  // We render the actual item slotted to fix/prevent the issue
  // of the tirgger flashing on the initial render
  const currentItem = useMemo(
    () =>
      mappedValues
        .flatMap(({ items }) => items)
        .find(item => item.value === value),
    [mappedValues, value]
  );

  const memoizedMappedValues = useMemo(() => {
    return mappedValues.map(({ label, items }, key) => (
      <SelectPrimitive.Group key={label?.toString() ?? key}>
        {label && (
          <SelectPrimitive.Label
            className={classNames(styles.item, styles.label)}
          >
            {label}
          </SelectPrimitive.Label>
        )}

        {items.map(({ value, label, iconImage, disabled }) => (
          <SelectPrimitive.Item
            key={value}
            value={value}
            disabled={disabled}
            className={classNames(styles.item, styles.text)}
          >
            <SelectPrimitive.ItemText>
              {iconImage}
              <span>{label}</span>
            </SelectPrimitive.ItemText>
          </SelectPrimitive.Item>
        ))}
      </SelectPrimitive.Group>
    ));
    // We explicitly want to recalculate these values only when the values themselves changed
    // This is to prevent re-rendering and re-calcukating the values on every render
  }, [JSON.stringify(values)]);

  // Both change the internal state and emit the change event
  const handleChange = (value: T) => {
    setValue(value);

    if (typeof onChange === 'function') {
      onChange(value);
    }
  };

  return (
    <Skeleton loading={loading}>
      <span
        className={classNames(
          styles.select,
          { [styles.inline]: inline },
          className,
          fallbackClass
        )}
      >
        {label && (
          <label className={styles.label} htmlFor={id}>
            {label}
          </label>
        )}

        <SelectPrimitive.Root
          value={currentItem !== undefined ? value : undefined}
          onValueChange={handleChange}
          disabled={disabled}
        >
          <SelectPrimitive.Trigger
            className={styles.trigger}
            aria-label={ariaLabel}
            id={id}
          >
            <SelectPrimitive.Value placeholder={placeholder}>
              {currentItem !== undefined && (
                <>
                  {currentItem.iconImage}
                  <span>{currentItem.label}</span>
                </>
              )}
            </SelectPrimitive.Value>
            <ChevronDownIcon className={styles.icon} />
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position={inline ? 'popper' : 'item-aligned'}
              className={classNames(
                styles.dropdown,
                { [styles.inline]: inline },
                dropdownClassName
              )}
            >
              <SelectPrimitive.ScrollUpButton>
                <ChevronUpIcon className={styles.scrollIcon} />
              </SelectPrimitive.ScrollUpButton>
              <SelectPrimitive.Viewport>
                {memoizedMappedValues}
              </SelectPrimitive.Viewport>
              <SelectPrimitive.ScrollDownButton>
                <ChevronDownIcon className={styles.scrollIcon} />
              </SelectPrimitive.ScrollDownButton>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      </span>
    </Skeleton>
  );
};

export default Select;
