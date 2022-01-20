import { NextPage } from "next/types";
import { ChangeEvent, useEffect, MouseEvent } from 'react';
import { useImmerAtom } from 'jotai/immer';
import { creatingTaskDetailAtom, monacoEditorAtom } from '../atoms';
import { CronTime, sampleFunction } from '@webest/web-page-monitor-helper';

import dynamic from 'next/dynamic'

// https://nextjs.org/docs/advanced-features/dynamic-import#with-no-ssr
const MonacoEditor = dynamic(
  () => import('../components/monaco-editor'),
  { ssr: false }
)

const CreateTaskPage: NextPage = () => {

  const [taskDetail, setTaskDetail] = useImmerAtom(creatingTaskDetailAtom);
  const [editorValue] = useImmerAtom(monacoEditorAtom);


  // update input date when first entry
  function updateDate() {
    setTaskDetail(v => {
      let nowDate = new Date();
      // TODO different type user, diff end time
      v.endLocalMinuteString = CronTime.toLocalISOString(nowDate, 7*60*24);
      v.startLocalMinuteString = CronTime.toLocalISOString(nowDate, 10);
    })
  }

  function handleInputChange(ev: ChangeEvent<HTMLInputElement>) {
    let inputElement = ev.target;
    let index = ev.target.dataset.inputIndex;
    if (index === '0') {
      setTaskDetail(v => {
        v.cronSyntax = inputElement.value;
      })
      let nextArr = CronTime.getNextTimes(inputElement.value);
      let [passed, errorMsg] = CronTime.checkTimes(nextArr);
      // console.log(nextArr, passed, errorMsg)
      if (passed) {
        setTaskDetail(v => {
          v.cronPassed = true;
          v.cronMsg = 'cron syntax check passed. ';
        })
      } else {
        setTaskDetail(v => {
          v.cronPassed = false;
          v.cronMsg = Array(errorMsg).join(' ');
        })
      }
    }
    if (index === '1') {
      if (!inputElement.validity.valid) return;
      const dtISO = CronTime.toLocalISOString(new Date(inputElement.value));
      setTaskDetail(v => {
        v.endLocalMinuteString = dtISO;
      })
    }
  }

  function handleBtnClick(ev: MouseEvent<HTMLButtonElement> ) {
    ev.preventDefault()
    console.log(editorValue);
    return true;
  }

  useEffect(() => {
    // https://stackoverflow.com/questions/53090432/
    // react-hooks-right-way-to-clear-timeouts-and-intervals
    updateDate();
    // let intervalId = setInterval(updateDate, 60*1000);
    // return ()=>{
    //   clearInterval(intervalId)
    // };
  }, []);

  return (<>
    <div>input cron syntax <br />{taskDetail.cronMsg}<br/>
      <input
        placeholder="cron syntax"
        data-input-index="0"
        value={taskDetail.cronSyntax}
        onChange={handleInputChange}
      >

      </input>
    </div>
    <div>continue loops,  until<br />
      <input
        placeholder="choose a time"
        value={taskDetail.endLocalMinuteString}
        data-input-index="1"
        onChange={handleInputChange}
        type="datetime-local"
        min={taskDetail.startLocalMinuteString}
        max={taskDetail.endLocalMinuteString}
      >
      </input>
    </div>
    <div>
      <MonacoEditor defaultValue={editorValue.createTaskDefaultValue}></MonacoEditor>
      {/* <MonacoEditor defaultValue={'111' + editorValue.createTaskDefaultValue }></MonacoEditor> */}
    </div>
    <div>
      <button data-btn-index="0" onClick={handleBtnClick} disabled={!taskDetail.cronPassed}>Create Now</button>
    </div>
  </>);
}

export default CreateTaskPage