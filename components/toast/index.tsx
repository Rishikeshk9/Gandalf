import React, { useEffect, useState } from "react";
// @ts-ignore

import * as Unicons from "@iconscout/react-unicons";

function Index({
  status,
  data,
  setToastShow,
  toastShow,
}: {
  status: any;
  data: any;
  setToastShow: any;
  toastShow: any;
}) {
  const [visible, setVisible] = useState<any>(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      //setVisible(!visible);
      setToastShow(false);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [toastShow]);
  return (
    <div className={`toast toast-end ${toastShow ? "visible" : "hidden"}`}>
      <div className={`alert alert-${status}`}>
        <div className="flex">
          <span className="flex text-white gap-x-2">
            {data}
            {status === "success" ? (
              <Unicons.UilCheckCircle size="24" color="#fff" />
            ) : status === "error" ? (
              <Unicons.UilTimesCircle size="24" color="#fff" />
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Index;
