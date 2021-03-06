# React-Edh-Js

## Install
npm
```
npm install --save @edhsdk/react-edh-js
```
yarn 
```
yarn add @edhsdk/react-edh-js
```

## Usage

Visit the [website](https://docs.digitalhumansdk.com/) for documentation and info on how to generate an API key. 

```javascript
import DigitalHuman from "@edhsdk/react-edh-js";

// ...
<DigitalHuman />
// ...

```
## Constructor options

| Key        | Type          | Description                                                            | Default     | Required |
| ---------- | ------------- | ---------------------------------------------------------------------- | ----------- | -------- |
| token      | String        | A required token to access the services provided                       |""           | yes      |
| human      | String        | The avatar name oneof "s_m_m_01", "s_m_f_01", s_m_f_01.                |"s_m_f_01"   | no       |
| renderMode | Number        | Controls developer mode vs live: Live: 0 Simple: 1                     | 1           | no       |
| inputMode  | Number        | Input to speech function: Text: 0, Speech: 1                           | 1           | no       |
| Steps      | []            | Speech steps (see docs for examples)                                   | null        | no       |
| style      | object        | Override the style of the player element                               | object      | no       |
| currStep   | string        | Required to play the speech steps. Update to play new step             | null        | no       |
| onCurrStepTrigger  | func()        | Callback function on speech completed.                         | null        | no       |
