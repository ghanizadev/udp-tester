import { app, Menu } from "electron";


const windows = [
    { id: '1', label: 'one' },
//   { type: "separator" },
  { id: '3', label: 'three', beforeGroupContaining: ['1'] },
  { id: '4', label: 'four', afterGroupContaining: ['2'] },
//   { type: 'separator' },
  { id: '2', label: 'two' }
];

const menu = Menu.buildFromTemplate(windows);

Menu.setApplicationMenu(menu);
