import { SettingData } from '../type'

export const handleOldVerSetting = (allSetting: any, newSetting: SettingData): SettingData => {
  for (const key in allSetting) {
    if (!newSetting.hasOwnProperty(key)) {
      delete allSetting[key]
    } else {
      if (allSetting[key] === null) {
        allSetting[key] = newSetting[key]
      }
    }
  }
  return allSetting
}
