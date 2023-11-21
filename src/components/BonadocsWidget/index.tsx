import './style.css'

import { BrowserProvider, Signer } from 'ethers'
import React, { useEffect, useState } from 'react'

import { loadWidgetExecutor, WidgetExecutor } from './lib'

export interface BonadocsWidgetProps {
  widgetConfigUri: string
  fallbackDocTextMd?: string
}

// Remove this and use FragmentDisplayDataEntry instead
export interface BonadocsWidgetParamProps {
  name: string
  type: string
}

export default function BonadocsWidget(props: BonadocsWidgetProps) {
  const [open, isOpen] = useState<boolean>(true)
  const [signer, setSigner] = useState<Signer | null>(null)
  const [widgetExecutor, setWidgetExecutor] = useState<WidgetExecutor | null>(null)
  const [methodParam, setMethodParam] = useState<boolean>(true)
  const [result, setResult] = useState<boolean>(false)
  const params: BonadocsWidgetParamProps[] = [
    {
      name: 'tokenA',
      type: 'address',
    },
    {
      name: 'tokenB',
      type: 'address',
    },
  ]

  const response: BonadocsWidgetParamProps[] = [
    {
      name: 'pair',
      type: 'address',
    },
  ]

  const parenthesis = `{`
  const parenthesisClose = `}`
  const transactionParams: BonadocsWidgetParamProps[] = [
    {
      name: 'Gas',
      type: 'number',
    },
    {
      name: 'Gas price',
      type: 'gwei',
    },
    {
      name: 'Value',
      type: 'string',
    },
    {
      name: 'From',
      type: 'address',
    },
  ]
  const widgetName = 'getPair'

  /**
   * Connects the users wallet to the documentation site so that they can
   * execute functions on the widget. This is not required for the widget
   * to work, but it is required for the user to be able to execute functions
   * on the blockchain. Simulations and read-only functions should work
   * without connecting a wallet.
   */
  function connectWallet() {
    if (!window.ethereum) {
      return
    }

    const provider = new BrowserProvider(window.ethereum)
    provider.getSigner().then(setSigner)
  }

  useEffect(() => {
    loadWidgetExecutor(props.widgetConfigUri).then(setWidgetExecutor)
  }, [])

  useEffect(() => {
    if (!signer || !widgetExecutor) {
      return
    }

    widgetExecutor.setSigner(signer)
  }, [signer, widgetExecutor])

  // you can get the function views from the widgetExecutor by using widgetExecutor.functionViews
  // const functionViews = widgetExecutor?.functionViews

  // Each function view holds the data you need to render the function on widget
  // You can get the display data by using functionView.displayData
  // functionView.setValue(path, value) to set the value of an input field
  // Look at the FunctionFragmentView class for more info
  // The widget executor also holds the functions to simulate and execute the functions
  // on the widget

  return (
    <>
      <div className="bonadocs__widget">
        <div className="bonadocs__widget__header">
          <div className="bonadocs__widget__header__deets">
            <h3 className="bonadocs__widget__header__deets__title">
              {widgetName}() <span className="bonadocs__widget__header__deets__title__info">read</span>
            </h3>
            <p className="bonadocs__widget__header__deets__description">
              Returns an address of the{' '}
              <span className="bonadocs__widget__header__deets__description__active">pair for tokenA and tokenB</span>
            </p>
          </div>

          <div className="bonadocs__widget__header__button" onClick={() => isOpen(!open)}>
            Try it out
            <img
              className={`bonadocs__widget__header__button__img ${open && 'transition'}`}
              src="https://res.cloudinary.com/dfkuxnesz/image/upload/v1700039314/chevron_v1lajx.svg"
            />
          </div>
        </div>

        {open && (
          <div id="bonadocs__widget__params" className="bonadocs__widget__params">
            <div className="bonadocs__widget__params__header">
              {!result ? (
                <>
                  <div
                    onClick={() => setMethodParam(true)}
                    className={`bonadocs__widget__params__header__method ${methodParam && 'border-b'}`}
                  >
                    Method params
                  </div>

                  <div
                    onClick={() => setMethodParam(false)}
                    className={`bonadocs__widget__params__header__transaction ${!methodParam && 'border-b'}`}
                  >
                    Transaction params
                  </div>
                </>
              ) : (
                <>
                  <div
                    onClick={() => setMethodParam(true)}
                    className={`bonadocs__widget__params__header__method ${methodParam && 'border-b'}`}
                  >
                    Output
                  </div>

                  <div
                    onClick={() => setMethodParam(false)}
                    className={`bonadocs__widget__params__header__transaction ${!methodParam && 'border-b'}`}
                  >
                    Event logs
                  </div>
                </>
              )}
            </div>
            {!result ? (
              <>
                {methodParam ? (
                  <div>
                    {params.map((param, index) => (
                      <p key={index} className="bonadocs__widget__params__name">
                        <span className="bonadocs__widget__params__name__title">{param.name}</span> ({param.type})
                        <input placeholder={param.type} className="bonadocs__widget__params__name__input" />
                      </p>
                    ))}
                  </div>
                ) : (
                  <div>
                    {transactionParams.map((param, index) => (
                      <p key={index} className="bonadocs__widget__params__name">
                        <span className="bonadocs__widget__params__name__title">{param.name}</span> ({param.type})
                        <input placeholder={param.type} className="bonadocs__widget__params__name__input" />
                      </p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="bonadocs__widget__codeblock">
                  <pre>
                    <code>
                      <>
                        <span className="bonadocs__widget__codeblock__inner__parenthesis">{parenthesis}</span>
                        {response.map((param, index) => (
                          <span key={index} className="bonadocs__widget__codeblock__inner bona-ml-4">
                            <span className="bonadocs__widget__codeblock__inner__name">“from”:</span>{' '}
                            <span className="bonadocs__widget__codeblock__inner__view">
                              "0xa4d3e318A00416fc8932aF9ac570ECfC50511502"
                            </span>
                          </span>
                        ))}
                        <span className="bonadocs__widget__codeblock__inner bonadocs__widget__codeblock__inner__parenthesis">
                          {parenthesisClose}
                        </span>
                      </>
                    </code>
                  </pre>
                </div>
              </>
            )}

            <div className="bonadocs__widget__params__call">
              <label className="bonadocs__widget__status">
                <input className="bonadocs__widget__status__input" type="checkbox" />
                <span className="bonadocs__widget__status__slider bonadocs__widget__status__round"></span>
              </label>
              <div className="bonadocs__widget__params__call__state">Query to mainnet</div>
              <img
                src="https://res.cloudinary.com/dfkuxnesz/image/upload/v1700238479/help-icon_qr1j0c.svg"
                alt="info icon"
                className="bonadocs__widget__params__call__info"
              />
              <div className="bonadocs__widget__params__call__status">
                <span className="bonadocs__circle"></span>
                <span>Not connected</span>
              </div>
              {!result ? (
                <>
                  {true && (
                    <button
                      onClick={() => setResult(true)}
                      id="ctn__button"
                      className="bonadocs__widget__params__button"
                      type="button"
                    >
                      Connect Wallet
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setResult(false)}
                  id="ctn__button"
                  className="bonadocs__widget__params__button"
                  type="button"
                >
                  Rerun method
                </button>
              )}
            </div>

            {/* <input id="query__button" className="bonadocs__widget__params__button" type="button" value="Query" /> */}
            {/* <div id="wallet__status" className="bonadocs__widget__status"></div> */}
          </div>
        )}

        <div className="bonadocs__widget__codeblock">
          <pre>
            <code>
              {/*
                  <!-- Method Without Param -->
                  <!-- <span className="bonadocs__widget__codeblock__inner">
                    <span className="bonadocs__widget__codeblock__inner__function">function</span> <span className="bonadocs__widget__codeblock__inner__name">accountingOracle </span> <span className="bonadocs__widget__codeblock__inner__parenthesis">()</span> <span className="bonadocs__widget__codeblock__inner__view">view returns</span> <span className="bonadocs__widget__codeblock__inner__parenthesis">(</span> <span className="bonadocs__widget__codeblock__inner__param">address</span> <span className="bonadocs__widget__codeblock__inner__parenthesis">)</span>
                  </span> -->
                  <!-- Method With Param(s) -->
                  */}
              <span className="bonadocs__widget__codeblock__inner">
                <span className="bonadocs__widget__codeblock__inner__function">function</span>{' '}
                <span className="bonadocs__widget__codeblock__inner__name">{widgetName}</span>{' '}
                <span className="bonadocs__widget__codeblock__inner__parenthesis">
                  (
                  {params.map((param, index) => (
                    <span key={index}>
                      <span className="bonadocs__widget__codeblock__inner__name">{param.type}</span>{' '}
                      <span className="bonadocs__widget__codeblock__inner__view">
                        {param.name}
                        {index === 0 && <>,</>}{' '}
                      </span>
                    </span>
                  ))}
                  )
                </span>{' '}
                <span className="bonadocs__widget__codeblock__inner__view">view returns</span>{' '}
                <span className="bonadocs__widget__codeblock__inner__parenthesis bonadocs__widget__codeblock__inner__parenthesis__ml-1">
                  (
                </span>
              </span>
              {/* <span className="bonadocs__widget__codeblock__inner ml-4">
                <span className="bonadocs__widget__codeblock__inner__name">address</span>{' '}
                <span className="bonadocs__widget__codeblock__inner__view">elRewardsVault</span>
              </span> */}

              <>
                {response.map((param, index) => (
                  <span key={index} className="bonadocs__widget__codeblock__inner bona-ml-4">
                    <span className="bonadocs__widget__codeblock__inner__name">{param.type} </span>{' '}
                    <span className="bonadocs__widget__codeblock__inner__view">{param.name}</span>
                  </span>
                ))}
              </>

              {/* <span className="bonadocs__widget__codeblock__inner ml-4">
                {' '}
                <span className="bonadocs__widget__codeblock__inner__name">address</span>{' '}
                <span className="bonadocs__widget__codeblock__inner__view">oracleReportSanityChecker</span>
              </span>
              <span className="bonadocs__widget__codeblock__inner ml-4">
                {' '}
                <span className="bonadocs__widget__codeblock__inner__name">address</span>{' '}
                <span className="bonadocs__widget__codeblock__inner__view">stakingRouter</span>
              </span>
              <span className="bonadocs__widget__codeblock__inner ml-4">
                {' '}
                <span className="bonadocs__widget__codeblock__inner__name">address</span>{' '}
                <span className="bonadocs__widget__codeblock__inner__view">treasury</span>
              </span>
              <span className="bonadocs__widget__codeblock__inner ml-4">
                {' '}
                <span className="bonadocs__widget__codeblock__inner__name">address</span>{' '}
                <span className="bonadocs__widget__codeblock__inner__view">withdrawalQueue</span>
              </span>
              <span className="bonadocs__widget__codeblock__inner ml-4">
                {' '}
                <span className="bonadocs__widget__codeblock__inner__name">address</span>{' '}
                <span className="bonadocs__widget__codeblock__inner__view">withdrawalVault</span>
              </span> */}
              <span className="bonadocs__widget__codeblock__inner bonadocs__widget__codeblock__inner__parenthesis">
                )
              </span>
            </code>
          </pre>
        </div>

        <div className="bonadocs__widget__footer">
          <span className="bonadocs__widget__footer__logo">
            powered by
            <img
              className="bonadocs__widget__footer__logo__img"
              src="https://res.cloudinary.com/dfkuxnesz/image/upload/v1700039425/logo_etfmtv.svg"
            />
          </span>
          <div className="bonadocs__widget__footer__info">Learn more</div>
        </div>
      </div>
    </>
  )
}
