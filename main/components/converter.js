/*
MIT License

Copyright (c) 2022 Harsha

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { AnimationClip, NumberKeyframeTrack } from "three";

var fps = 60;

function modifiedKey(key) {
  if (
    [
      "eyeLookDownLeft",
      "eyeLookDownRight",
      "eyeLookInLeft",
      "eyeLookInRight",
      "eyeLookOutLeft",
      "eyeLookOutRight",
      "eyeLookUpLeft",
      "eyeLookUpRight",
    ].includes(key)
  ) {
    return key;
  }

  if (key.endsWith("Right")) {
    return key.replace("Right", "_R");
  }
  if (key.endsWith("Left")) {
    return key.replace("Left", "_L");
  }
  return key;
}

function createAnimation(recordedData, morphTargetDictionary, bodyPart) {
  if (recordedData.length != 0) {
    let animation = [];
    for (let i = 0; i < Object.keys(morphTargetDictionary).length; i++) {
      animation.push([]);
    }
    let time = [];
    let finishedFrames = 0;
    recordedData.forEach((d, i) => {
      Object.entries(d.blendshapes).forEach(([key, value]) => {
        if (!(modifiedKey(key) in morphTargetDictionary)) {
          return;
        }

        if (key == "mouthShrugUpper") {
          value += 0.4;
        }

        animation[morphTargetDictionary[modifiedKey(key)]].push(value);
      });
      time.push(finishedFrames / fps);
      finishedFrames++;
    });

    let tracks = [];

    Object.entries(recordedData[0].blendshapes).forEach(([key, value]) => {
      if (!(modifiedKey(key) in morphTargetDictionary)) {
        return;
      }

      let i = morphTargetDictionary[modifiedKey(key)];

      let track = new NumberKeyframeTrack(
        `${bodyPart}.morphTargetInfluences[${i}]`,
        time,
        animation[i]
      );

      tracks.push(track);
    });

    const clip = new AnimationClip("animation", -1, tracks);
    return clip;
  }
  return null;
}

export default createAnimation;
