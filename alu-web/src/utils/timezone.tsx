import Form from 'react-bootstrap/Form';

const timezones = [
  { name: 'GMT-12', description: 'International Date Line West (IDLW)', value: 720 },
  { name: 'GMT-11', description: 'Nome Time (NT)', value: 660 },
  { name: 'GMT-10', description: 'Hawaii Standard Time (HST)', value: 600 },
  { name: 'GMT-9', description: 'Alaska Standard Time (AKST)', value: 540 },
  { name: 'GMT-8', description: 'Pacific Standard Time (PST)', value: 480 },
  { name: 'GMT-7', description: 'Mountain Standard Time (MST)', value: 420 },
  { name: 'GMT-6', description: 'Central Standard Time (CST)', value: 360 },
  { name: 'GMT-5', description: 'Eastern Standard Time (EST)', value: 300 },
  { name: 'GMT-4', description: 'Atlantic Standard Time (AST)', value: 240 },
  { name: 'GMT-3', description: 'Argentina Time (ART)', value: 180 },
  { name: 'GMT-2', description: 'Azores Time (AT)', value: 120 },
  { name: 'GMT-1', description: 'West Africa Time (WAT)', value: 60 },
  { name: 'GMT+0', description: 'Greenwich Mean Time (GMT)', value: 0 },
  { name: 'GMT+1', description: 'Central European Time (CET)', value: -60 },
  { name: 'GMT+2', description: 'Eastern European Time (EET)', value: -120 },
  { name: 'GMT+3', description: 'Moscow Time (MSK)', value: -180 },
  { name: 'GMT+4', description: 'Armenia Time (AMT)', value: -240 },
  { name: 'GMT+5', description: 'Pakistan Standard Time (PKT)', value: -300 },
  { name: 'GMT+6', description: 'Omsk Time (OMSK)', value: -360 },
  { name: 'GMT+7', description: 'Kranoyask Time (KRAT)', value: -420 },
  { name: 'GMT+8', description: 'China Standard Time (CST)', value: -480 },
  { name: 'GMT+9', description: 'Japan Standard Time (JST)', value: -540 },
  { name: 'GMT+10', description: 'Eastern Australia Standard Time (AEST)', value: -600 },
  { name: 'GMT+11', description: 'Sakhalin Time (SAKT)', value: -660 },
  { name: 'GMT+12', description: 'New Zealand Standard Time (NZST)', value: -720 },
];

export default function TZSelect() {
  return (
    <Form.Control
      as='select'
      name='timezone'
      defaultValue={new Date().getTimezoneOffset()}
      custom
    >
      {timezones.map((timezone, i) => <option value={timezone.value} key={i}>
        {timezone.name}: {timezone.description}
      </option>)}
    </Form.Control>
  );
}
