import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import './DatePicker.css';

import { DateRangePicker } from 'react-dates';
import React, { useState } from 'react';

export default function DatePicker({startDate, endDate, minDate, maxDate, onChange}) {
  const [focused, setFocused] = useState(null);
  return (
    <DateRangePicker
        startDate={startDate}
        startDateId='startDate'
        endDate={endDate}
        endDateId='endDate'
        onDatesChange={({ startDate, endDate }) => console.log(startDate, endDate)}
        focusedInput={focused}
        onFocusChange={focusedInput => setFocused(focusedInput)}
        minDate={minDate}
        maxDate={maxDate}
        isDayBlocked={(day) => day < minDate || day > maxDate}
    />
  );
}