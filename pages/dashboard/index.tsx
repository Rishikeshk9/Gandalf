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
  const [data, setData] = useState<any>({});
  const [toastShow, setToastShow] = useState<any>(false);
  const [toastData, setToastData] = useState<any>(null);
  const [toastStatus, setToastStatus] = useState<any>(false);
  const [connectedWallet, setConnectedWallet] = useState<any>(null);
  const [userSignature, setUserSignature] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const createKey = async () => {
    let _formData = new FormData();
    if (formData?.mail && formData?.name) {
      try {
        setLoading(true);
        await signMessage("Creating API Key for " + formData?.name);
        _formData.append("companyName", formData?.name);
        _formData.append("email", formData?.mail);
        _formData.append("signature", userSignature);
        _formData.append("walletAddress", connectedWallet);
        const options = {
          headers: {
            "X-Custom-Header": "value",
            "Content-Type": "application/json",
          },
        };
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER}/createKey`,
          _formData,
          options
        );
        //setData(response);
        setToastShow(true);
        setToastStatus("success");
        setToastData("🎉 API Key Generated");
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

  const getKey = async () => {
    let _formData = new FormData();

    if (connectedWallet) {
      try {
        setLoading(true);

        _formData.append("signature", userSignature);
        _formData.append("walletAddress", connectedWallet);
        const options = {
          headers: {
            "X-Custom-Header": "value",
            "Content-Type": "application/json",
          },
        };
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER}/getKey`,
          _formData,
          options
        );
        setData(response?.data);

        setToastShow(true);

        if (response?.data?.status == 200) {
          setToastData("🎉 Welcome Back!" + response?.data?.companyName);
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

  useEffect(() => {
    const init = async () => {
      await signMessage("Requesting API Key for " + connectedWallet);
    };
    if (connectedWallet) init();
  }, [connectedWallet]);

  useEffect(() => {
    if (userSignature) getKey();
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
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  //   async function getFlowBalance() {
  //     const api = "https://rest-testnet.onflow.org";
  //     config().put("accessNode.api", api);
  //     const cadence = `
  //         import FungibleToken from 0x9a0766d93b6608b7
  //         import FlowToken from 0x7e60df042a9c0868

  // pub fun main(account: Address): UFix64 {

  //     let vaultRef = getAccount(account)
  //         .getCapability(/public/flowTokenBalance)
  //         .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
  //         ?? panic("Could not borrow Balance reference to the Vault")

  //     return vaultRef.balance
  // }
  //       `;
  //     const balance = await query({
  //       cadence,
  //       args: (arg: any, t: any) => [arg(connectedWallet.toString(), t.Address)],
  //     });
  //     console.log(balance);
  //   }

  return (
    <>
      <Navbar />

      <Toast
        status={toastStatus}
        data={toastData}
        setToastShow={setToastShow}
        toastShow={toastShow}
      />

      <div className="flex flex-col justify-center align-middle items-center  p-5 gap-y-2 ">
        {!data?.apiKey ? (
          <>
            <div className="bg-base-300 p-7 rounded-xl space-y-4 w-full sm:w-2/3 md:w-1/3 drop-shadow-md transition-all duration-200 hover:border-b-2   border-purple-700   ">
              <div className="w-full">
                <label className="label">
                  <span className="label-text">What is your Company name?</span>
                </label>
                <input
                  disabled={!connectedWallet}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  type="text"
                  placeholder="Black Rock"
                  className="input input-bordered w-full  placeholder-slate-600 focus:ring-1 focus:ring-purple-700  "
                />
              </div>
              <div className="w-full">
                <label className="label">
                  <span className="label-text">Company E-mail ID</span>
                </label>
                <input
                  disabled={!connectedWallet}
                  onChange={(e) =>
                    setFormData({ ...formData, mail: e.target.value })
                  }
                  type="email"
                  placeholder="name@blackrock.com"
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
                      await createKey();
                    }}
                  >
                    Get API Key
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
            </div>
          </>
        ) : (
          <div
            className={`${
              !data?.apiKey ? "hidden" : ""
            } flex flex-col text-left`}
          >
            <p>
              <strong>Company Name :</strong> {data?.companyName}
            </p>
            <p>
              <strong>Mail ID : </strong>
              {data?.email}
            </p>
            <p>
              <strong>API Key : </strong>
              {data?.apiKey}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default Index;
