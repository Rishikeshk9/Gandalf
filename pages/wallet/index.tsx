// @ts-ignore

import Toast from "@/components/toast";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import axios from "axios";
// @ts-ignore

import * as fcl from "@onflow/fcl";
// @ts-ignore

import { query, config } from "@onflow/fcl";

fcl
  .config()
  .put("accessNode.api", "https://rest-testnet.onflow.org") // replace with the address of the access node you want to use
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  //.put("challenge.handshake", "https://flow-wallet-testnet.blocto.app/authn") // replace with the URL of the authentication service you want to use
  .put("challenge.scope", "email") // replace with the authentication scope you want to use
  .put("0xFlowBalance.authorizedMinter", "0x01") // replace with the authorized minter address for your token
  .put("0xFungibleToken.authorizedMinter", "0x01"); // replace with the authorized minter address for your token

function Index() {
  const [formData, setFormData] = useState<any>(null);
  const [data, setData] = useState<any>();
  const [toastShow, setToastShow] = useState<any>(false);
  const [toastData, setToastData] = useState<any>(null);
  const [toastStatus, setToastStatus] = useState<any>(false);
  const [connectedWallet, setConnectedWallet] = useState<any>(null);
  const [userSignature, setUserSignature] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [decrypted, setDecrypt] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<any>({});

  const createUser = async () => {
    let _formData = new FormData();
    if (formData?.mail && formData?.name) {
      try {
        setLoading(true);
        await signMessage("Registering User " + formData?.name);
        _formData.append("name", formData?.name);
        _formData.append("email", formData?.mail);
        _formData.append("signature", userSignature);
        _formData.append("walletAddress", connectedWallet);
        _formData.append("apiKey", process.env.NEXT_PUBLIC_API_KEY || "");

        const options = {
          headers: {
            "X-Custom-Header": "value",
            "Content-Type": "application/json",
            "Api-key": `${process.env.NEXT_PUBLIC_API_KEY}`,
          },
        };
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER}/createUser`,
          _formData,
          options
        );
        if (response.data.scriptCadence) {
          setData(response.data.scriptCadence);
          runScript(response.data.scriptCadence);
        }
        setLoading(false);
        console.log(response);
      } catch (error) {
        console.log(error);
        setToastShow(true);
        setToastStatus("error");
        setToastData(error);
        setLoading(false);
      }
    } else {
      setToastShow(true);
      setToastStatus("error");
      setToastData("Fill all Fields");
      setLoading(false);
    }
  };

  const getUserDetails = async () => {
    let _formData = new FormData();

    if (connectedWallet) {
      try {
        setLoading(true);

        _formData.append("signature", userSignature);
        _formData.append("walletAddress", connectedWallet);
        _formData.append("apiKey", process.env.NEXT_PUBLIC_API_KEY || "");

        const options = {
          headers: {
            "X-Custom-Header": "value",
            "Content-Type": "application/json",
            "Api-key": `${process.env.NEXT_PUBLIC_API_KEY}`,
          },
        };
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER}/getUserDetail`,
          _formData,
          options
        );
        setData(response?.data.vault);
        setUserDetails({
          ...userDetails,
          name: response.data.name,
          email: response.data.email,
        });
        setToastShow(true);

        if (response?.data?.status == 200) {
          setToastData("🎉 Data Fetched");
          setToastStatus("success");
        } else if (response?.data?.status != 200) {
          setToastData(response?.data?.msg);
          setToastStatus("error");
        }

        setLoading(false);
        console.log(response);
      } catch (error) {
        console.log(error);
        setToastShow(true);
        setToastStatus("error");
        setToastData(error);
        setLoading(false);
      }
    } else {
      setToastShow(true);
      setToastStatus("error");
      setToastData("Error getting Key");
      setLoading(false);
    }
  };

  const createData = async () => {
    let _formData = new FormData();
    if (formData?.title && formData?.value) {
      try {
        setLoading(true);
        await signMessage("Adding User Data from " + connectedWallet);
        _formData.append("field", formData?.title);
        _formData.append("value", formData?.value);
        _formData.append("signature", userSignature);
        _formData.append("walletAddress", connectedWallet);
        _formData.append(
          "apiKey",
          process.env.NEXT_PUBLIC_API_KEY || "u1tgMMK9vl"
        );

        const options = {
          headers: {
            "X-Custom-Header": "value",
            "Content-Type": "application/json",
            "Api-key": `${process.env.NEXT_PUBLIC_API_KEY}`,
          },
        };
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER}/addUserData`,
          _formData,
          options
        );
        if (response.data.scriptCadence) {
          setData(response.data.scriptCadence);
          runScript(response.data.scriptCadence);
        }
        setLoading(false);
        console.log(response);
      } catch (error) {
        console.log(error);
        setToastShow(true);
        setToastStatus("error");
        setToastData(error);
        setLoading(false);
      }
    } else {
      setToastShow(true);
      setToastStatus("error");
      setToastData("Fill all Fields");
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await signMessage("Getting User Data for " + connectedWallet);
    };
    if (connectedWallet) init();
  }, [connectedWallet]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // call your function here
  //     if (userSignature) getUserDetails();
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    if (userSignature) getUserDetails();
  }, [userSignature]);

  async function connect() {
    const user = await fcl.authenticate();

    console.log(user);
    setConnectedWallet(user.addr);
    setToastShow(true);
    setToastStatus("success");
    setToastData("Wallet Connected");
  }

  const signMessage = async (msg: string) => {
    const MSG = Buffer.from(msg).toString("hex");
    try {
      console.log(msg);
      let data = await fcl.currentUser.signUserMessage(MSG);
      // console.log(data);

      // const isValid = await fcl.AppUtils.verifyUserSignatures(
      //   Buffer.from("FOO").toString("hex"),
      //   data
      // );
      setUserSignature(JSON.stringify(data[0]));
      getUserDetails();
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  async function runScript(cadence: string) {
    if (cadence) {
      setToastShow(true);
      setToastStatus("info");
      setToastData("🎉 Running Scripts");

      const transactionId = await fcl.mutate({
        cadence: cadence,
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        limit: 999,
      });

      const transaction = await fcl.tx(transactionId).onceSealed();

      setToastShow(true);
      setToastStatus("info");
      setToastData("🎉 Account Created" + transaction.events[0].transactionId);
      console.log("🎉 Account Created" + transaction.events[0].transactionId);

      setLoading(false);
      console.log(transaction); // The transactions status and events after being sealed
    }
  }

  return (
    <>
      <Navbar />

      <Toast
        status={toastStatus}
        data={toastData}
        setToastShow={setToastShow}
        toastShow={toastShow}
      />

      <div className="  grid grid-cols-2 ">
        {userDetails ? (
          <>
            <div className="flex flex-col   justify-center align-middle items-center  p-5 gap-y-2 ">
              {!data?.apiKey ? (
                <>
                  <div className="bg-base-300 p-7 rounded-xl space-y-4 w-full sm:w-2/3 md:w-1/3 drop-shadow-md transition-all duration-200 hover:border-b-2   border-purple-700   ">
                    <div className="w-full">
                      <label className="label">
                        <span className="label-text">What is your Name?</span>
                      </label>
                      <input
                        disabled={!connectedWallet}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        type="text"
                        placeholder="Adams"
                        className="input input-bordered w-full  placeholder-slate-600 focus:ring-1 focus:ring-purple-700  "
                      />
                    </div>
                    <div className="w-full">
                      <label className="label">
                        <span className="label-text">Personal E-mail ID</span>
                      </label>
                      <input
                        disabled={!connectedWallet}
                        onChange={(e) =>
                          setFormData({ ...formData, mail: e.target.value })
                        }
                        type="email"
                        placeholder="adamas@aol.com"
                        className="input input-bordered w-full  placeholder-slate-600 focus:ring-1 focus:ring-purple-700  "
                      />
                    </div>
                    <div className="space-x-2">
                      {connectedWallet ? (
                        <button
                          className={`btn     ${
                            loading
                              ? "loading"
                              : "" || (formData?.name && formData?.mail)
                              ? "btn-active btn-primary"
                              : "btn-outline btn-disabled"
                          }
                }`}
                          onClick={async () => {
                            setLoading(true);
                            await createUser();
                          }}
                        >
                          Create Account
                        </button>
                      ) : (
                        <button
                          className="btn btn-active btn-primary"
                          onClick={async () => await connect()}
                        >
                          {connectedWallet ? connectedWallet : "Connect Wallet"}
                        </button>
                      )}
                    </div>
                    <button
                      className={`btn    btn-square
                }`}
                      onClick={async () => {
                        setLoading(true);
                        await getUserDetails();
                      }}
                    >
                      X
                    </button>
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </>
        ) : (
          <></>
        )}

        {userDetails.name ? (
          <>
            <div className="p-6">
              <div className="flex flex-col">
                <div>
                  Hello <strong>{userDetails.name}👋</strong>
                </div>
              </div>
              <label htmlFor="my-modal" className="btn my-4">
                Add Data
              </label>
              {/* Put this part before </body> tag */}
              <input type="checkbox" id="my-modal" className="modal-toggle" />
              <div className="modal">
                <div className="modal-box">
                  <div className="bg-base-300 p-7 rounded-xl space-y-4 w-full sm:w-2/3 md:w-1/3 drop-shadow-md transition-all duration-200 hover:border-b-2   border-purple-700   ">
                    <div className="w-full">
                      <label className="label">
                        <span className="label-text">Title</span>
                      </label>
                      <input
                        disabled={!connectedWallet}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        type="text"
                        placeholder="Netflix"
                        className="input input-bordered w-full  placeholder-slate-600 focus:ring-1 focus:ring-purple-700  "
                      />
                    </div>
                    <div className="w-full">
                      <label className="label">
                        <span className="label-text">Value</span>
                      </label>
                      <input
                        disabled={!connectedWallet}
                        onChange={(e) =>
                          setFormData({ ...formData, value: e.target.value })
                        }
                        type="text"
                        placeholder="password"
                        className="input input-bordered w-full  placeholder-slate-600 focus:ring-1 focus:ring-purple-700  "
                      />
                    </div>
                    <div className="space-x-2">
                      {connectedWallet ? (
                        <button
                          className={`btn     ${
                            loading
                              ? "loading"
                              : "" || (formData?.title && formData?.value)
                              ? "btn-active btn-primary"
                              : "btn-outline btn-disabled"
                          }
                }`}
                          onClick={async () => {
                            setLoading(true);
                            await createData();
                          }}
                        >
                          Create Data
                        </button>
                      ) : (
                        <button
                          className="btn btn-active btn-primary"
                          onClick={async () => await connect()}
                        >
                          {connectedWallet ? connectedWallet : "Connect Wallet"}
                        </button>
                      )}
                    </div>
                    <button
                      className={`btn    btn-square
                }`}
                      onClick={async () => {
                        setLoading(true);
                        await getUserDetails();
                      }}
                    >
                      X
                    </button>
                  </div>
                  <div className="modal-action">
                    <label htmlFor="my-modal" className="btn">
                      Yay!
                    </label>
                  </div>
                </div>
              </div>
              <div className={` flex flex-col text-left`}>
                <div className="overflow-x-auto w-full">
                  <table className="table w-full">
                    {/* head */}
                    <thead>
                      <tr>
                        <th>
                          <label>
                            <input type="checkbox" className="checkbox" />
                          </label>
                        </th>
                        <th>Name</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* row 1 */}

                      {data &&
                        data?.map((data: any, index: any) => {
                          console.log("DATA ::::", data);
                          return (
                            <tr key={index}>
                              <th>
                                <label>
                                  <input type="checkbox" className="checkbox" />
                                </label>
                              </th>
                              <td>
                                <div className="flex items-center space-x-3">
                                  <div className="avatar hidden">
                                    <div className="mask mask-squircle w-12 h-12">
                                      <img
                                        src="/tailwind-css-component-profile-2@56w.png"
                                        alt="Avatar Tailwind CSS Component"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-semibold">
                                      {data.name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="flex align-middle items-center gap-3">
                                <div className="text-sm opacity-50">
                                  {decrypted ? data.decrypted : data.value}
                                </div>

                                <button
                                  className="btn btn-ghost  "
                                  onClick={async () => setDecrypt(!decrypted)}
                                >
                                  {decrypted ? "Hide" : "Decrypt"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                    {/* foot */}
                    <tfoot>
                      <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Description</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

export default Index;
