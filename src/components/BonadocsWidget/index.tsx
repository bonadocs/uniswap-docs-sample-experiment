import './style.css'

import { BrowserProvider, Signer, ParamType } from 'ethers'
import React, { useEffect, useState, useRef } from 'react'

import { loadWidgetExecutor, WidgetExecutor, FragmentDisplayData } from './lib'

export interface BonadocsWidgetProps {
  widgetConfigUri: string
  fallbackDocText?: string
}

// Remove this and use FragmentDisplayDataEntry instead
export interface BonadocsWidgetParamProps {
  name: string
  type: string
}
const initialState = { accounts: [], balance: '', chainId: '' }
// let injectedProvider = false

// if (typeof window.ethereum !== 'undefined') {
//   injectedProvider = true
//   console.log(window.ethereum)
// }

// const isMetaMask = injectedProvider ? window.ethereum.isMetaMask : false

export default function BonadocsWidget(props: BonadocsWidgetProps) {
  const [open, isOpen] = useState<boolean>(true)
  const [signer, setSigner] = useState<Signer | null>(null)
  const [methodParam, setMethodParam] = useState<boolean>(true)
  const [result, setResult] = useState<boolean>(false)
  const [hasProvider, setHasProvider] = useState<BrowserProvider>(null)
  const [queryMainnet, setQueryMainnet] = useState<boolean>(false)
  const [readMethod, setReadMethod] = useState<boolean>(true)
  const [stateMutability, setStateMutability] = useState<string>('')
  const [connected, setConnected] = useState<boolean>()
  const [widgetName, setWidgetName] = useState<string>('')
  const [params, setParams] = useState<FragmentDisplayData>([])
  const [response, setResponse] = useState<readonly ParamType[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [openTransactionParams, setOpenTransactionParams] = useState<boolean>(!readMethod)
  const [account, setAccount] = useState<string>('')
  const [chainId, setChainId] = useState<string>()
  const widgetExecutor = useRef<WidgetExecutor | null>(null)

  const parenthesis = `{`
  const parenthesisClose = `}`
  const transactionParams: BonadocsWidgetParamProps[] = [
    {
      name: 'From',
      type: 'address',
    },
    {
      name: 'Value',
      type: 'string',
    },

    {
      name: 'Gas',
      type: 'number',
    },
    {
      name: 'Gas price',
      type: 'gwei',
    },
  ]

  /**
   * Connects the users wallet to the documentation site so that they can
   * execute functions on the widget. This is not required for the widget
   * to work, but it is required for the user to be able to execute functions
   * on the blockchain. Simulations and read-only functions should work
   * without connecting a wallet.
   */
  const connectWallet = async () => {
    if (!window.ethereum) {
      return
    }

    window.ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        if (err.code === 4001) {
          console.log('Please connect to MetaMask.')
        } else {
          console.error(err)
        }
      })
  }

  const getSigner = () => {
    hasProvider.getSigner().then(setSigner)
  }

  async function checkConnection() {
    window.ethereum.request({ method: 'eth_accounts' }).then(handleAccountsChanged).catch(console.error)
    window.ethereum.request({ method: 'eth_chainId' }).then(handleChainChanged).catch(console.error)
    // const { name } = await hasProvider.getNetwork()
    // console.log(name)
  }

  function handleAccountsChanged(accounts) {
    console.log(accounts)

    if (accounts.length === 0) {
      setConnected(false)
    } else if (accounts[0]) {
      setAccount(accounts[0])
      setConnected(true)
    }
  }

  function handleChainChanged(chainId: string) {
    const chainIdNum = parseInt(chainId)
    setChainId(chainIdNum.toString())
  }

  async function getWidgetCaller() {
    const functionViews = await loadWidgetExecutor(props.widgetConfigUri)
    widgetExecutor.current = functionViews
    //console.log(widgetExecutor.current.functionViews)
    if (widgetExecutor.current.functionViews.length === 1) {
      const currentFunction = widgetExecutor.current.functionViews[0].functionFragment
      setWidgetName(currentFunction.name)
      setParams(widgetExecutor.current.functionViews[0].displayData)
      console.log(widgetExecutor.current.functionViews[0])

      setResponse(currentFunction.outputs)
      setStateMutability(currentFunction.stateMutability)
      if (currentFunction.stateMutability == 'view' || currentFunction.stateMutability == 'pure') {
        setReadMethod(true)
      } else {
        setReadMethod(false)
      }
    }
  }

  function displayButton() {
    return readMethod ? `Query` : queryMainnet ? (connected ? `Query` : `Connect Wallet`) : `Query`
  }

  function connectionStatus() {
    return connected ? `Connected to ${chainId}` : `Not Connected`
  }

  async function ctabutton() {
    switch (displayButton()) {
      case `Query`:
        if (queryMainnet) {
          getSigner()
          console.log('wef3', widgetExecutor.current)

          const res = await widgetExecutor.current.execute()
          console.log(res)
        } else {
          console.log('wef')

          widgetExecutor.current.simulate()
        }
        break
      case `Connect Wallet`:
        connectWallet()
        break
    }
  }

  useEffect(() => {
    getWidgetCaller()
    if (!window.ethereum) {
      return
    }

    const provider = new BrowserProvider(window.ethereum)
    setHasProvider(provider)

    if (provider) {
      window.ethereum?.on('accountsChanged', handleAccountsChanged)
      window.ethereum?.on('chainChanged', handleChainChanged)
      // connect btn is initially disabled

      checkConnection()
    } else {
      console.log('Please install MetaMask!')
    }
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  useEffect(() => {
    if (!signer || !widgetExecutor.current) {
      return
    }

    widgetExecutor.current.setSigner(signer)
  }, [signer])

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
            <p className="bonadocs__widget__header__deets__description">{props.fallbackDocText}</p>
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
              {result && (
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

            <div className="bonadocs__widget__params__status">
              {readMethod && queryMainnet ? (
                <></>
              ) : (
                <div
                  className={`bonadocs__widget__params__call__status ${
                    connected && queryMainnet && 'connected__green'
                  }`}
                >
                  {queryMainnet ? (
                    <span className={`bonadocs__circle ${connected && 'connected__green__circle'}`}></span>
                  ) : (
                    <span className="bonadocs__circle__simulation"></span>
                  )}

                  {queryMainnet ? <span>{connectionStatus()}</span> : <span>Simulation</span>}
                </div>
              )}
              <div className="bonadocs__widget__params__status__info">
                <label className="bonadocs__widget__status">
                  <input
                    className="bonadocs__widget__status__input"
                    type="checkbox"
                    onChange={() => setQueryMainnet(!queryMainnet)}
                  />
                  <span className="bonadocs__widget__status__slider bonadocs__widget__status__round"></span>
                </label>
                <div className="bonadocs__widget__params__call__state">Query to mainnet</div>
                <img
                  src="https://res.cloudinary.com/dfkuxnesz/image/upload/v1700238479/help-icon_qr1j0c.svg"
                  alt="info icon"
                  className="bonadocs__widget__params__call__info"
                />
              </div>
            </div>

            {!result ? (
              <div className="bonadocs__widget__params__wrapper">
                <div>
                  <div className="bonadocs__widget__params__header">METHOD PARAMS</div>
                  {params.map(({ name, index, baseType, indent, arrayIndex, arrayPath, path, indexInArray }, i) => (
                    <ParamsList
                      params={params}
                      functionView={widgetExecutor.current.functionViews[0]}
                      key={i}
                      name={name}
                      index={index}
                      baseType={baseType}
                      indent={indent}
                      arrayIndex={arrayIndex}
                      arrayPath={arrayPath}
                      path={path}
                      indexInArray={indexInArray}
                    />
                  ))}
                </div>

                <div>
                  <div
                    onClick={() => setOpenTransactionParams(!openTransactionParams)}
                    className="bonadocs__widget__params__header"
                  >
                    {' '}
                    <span className="bonadocs__flex">
                      {/* <img
                        className={`bonadocs__widget__params__header__icon ${openTransactionParams && 'transition'}`}
                        src="https://res.cloudinary.com/dfkuxnesz/image/upload/v1701511277/chevron-down_bi54fj.svg"
                      /> */}
                      <svg
                        className={`bonadocs__widget__params__header__icon ${openTransactionParams && 'transition'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill="white"
                          d="M7.646 4.147a.5.5 0 0 1 .707-.001l5.484 5.465a.55.55 0 0 1 0 .779l-5.484 5.465a.5.5 0 0 1-.706-.708L12.812 10L7.647 4.854a.5.5 0 0 1-.001-.707Z"
                        />
                      </svg>
                    </span>
                    TRANSACTION PARAMS
                  </div>
                  {openTransactionParams && (
                    <div>
                      {transactionParams.map((param, index) => (
                        <p key={index} className="bonadocs__widget__params__name">
                          <span className="bonadocs__widget__params__name__title">{param.name}</span> ({param.type})
                          <input placeholder={param.type} className="bonadocs__widget__params__name__input" />
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
              {!result ? (
                <>
                  {hasProvider ? (
                    <button
                      onClick={() => ctabutton()}
                      id="ctn__button"
                      className="bonadocs__widget__params__button"
                      type="button"
                    >
                      {displayButton()}
                    </button>
                  ) : (
                    <a
                      href="https://metamask.io/"
                      target="_blank"
                      id="ctn__button"
                      rel="noreferrer"
                      className="bonadocs__widget__params__button"
                    >
                      Install metamask wallet 🦊
                    </a>
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
              <span className="bonadocs__widget__codeblock__inner">
                <span className="bonadocs__widget__codeblock__inner__function">function</span>{' '}
                <span className="bonadocs__widget__codeblock__inner__name">{widgetName}</span>{' '}
                <span className="bonadocs__widget__codeblock__inner__parenthesis">
                  (
                  {params.map((param, index) => (
                    <span key={index}>
                      <span className="bonadocs__widget__codeblock__inner__name">{param.baseType}</span>{' '}
                      <span className="bonadocs__widget__codeblock__inner__view">
                        {param.name}
                        {index === 0 && <>,</>}{' '}
                      </span>
                    </span>
                  ))}
                  )
                </span>{' '}
                <span className="bonadocs__widget__codeblock__inner__view">{stateMutability} returns</span>{' '}
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
                    <span className="bonadocs__widget__codeblock__inner__name">{param.baseType} </span>{' '}
                    <span className="bonadocs__widget__codeblock__inner__view">{param.name}</span>
                  </span>
                ))}
              </>

              <span className="bonadocs__widget__codeblock__inner bonadocs__widget__codeblock__inner__parenthesis">
                )
              </span>
            </code>
          </pre>
        </div>

        <div className="bonadocs__widget__footer">
          <a href="https://bonadocs.com" target="_blank" rel="noreferrer" className="bonadocs__widget__footer__logo">
            powered by
            <img
              className="bonadocs__widget__footer__logo__img"
              src="https://res.cloudinary.com/dfkuxnesz/image/upload/v1700039425/logo_etfmtv.svg"
            />
          </a>
          <a href="https://bonadocs.com" target="_blank" rel="noreferrer" className="bonadocs__widget__footer__info">
            Learn more
          </a>
        </div>
      </div>
    </>
  )
}

export const ParamsList = ({
  name,
  index,
  baseType,
  indent,
  arrayIndex,
  arrayPath,
  path,
  indexInArray,
  i,
  method,
  params,
  addArrayItem,
  handleInputChange,
  deleteAtSpecificIndex,
  functionView,
}) => {
  return (
    <div
      className={`
        ${indent === 0 && 'bonadocs__method__parameters__item'}
        ${i === 0 && 'bt-0'}
      `}
      style={{ marginLeft: `${indent * 1.4}rem` }}
    >
      <p key={i} className="bonadocs__widget__params__name">
        <span className="bonadocs__widget__params__name__title">{name}</span> ({baseType})
        {baseType !== 'tuple' && baseType !== 'array' && baseType !== 'bool' && (
          <TextInput
            // dataKey={method.inputDataKey}
            className="method__parameters__input"
            path={path}
            name={name}
            baseType={baseType}
            functionView={functionView}
          />
        )}
        {baseType === 'bool' && <SelectInput functionView={functionView} path={path} index={i} baseType={baseType} />}
        {baseType === 'array' && (
          <button
            className="bonadocs__method__parameters__button"
            onClick={() => functionView.addArrayItem(arrayIndex)}
          >
            <img src="https://res.cloudinary.com/dfkuxnesz/image/upload/v1701454098/plus-blue_jgcyvx.svg" />
            Add array property
          </button>
        )}
        {arrayPath && (
          <button
            className="method__parameters__button__remove"
            onClick={() => {
              functionView.deleteAtSpecificIndex(arrayIndex, indexInArray)
            }}
          >
            <img src="https://res.cloudinary.com/dfkuxnesz/image/upload/v1701455363/close_isqdse.svg" />
          </button>
        )}
      </p>
    </div>
  )
}

export const TextInput = ({ className, name, baseType, path, functionView }) => {
  const [, setText] = useState('')
  const value = functionView.getValue('')
  // const docValue = functionView.getString(docKey, path)

  if (value == null) {
    functionView.setValue(path, '')
  }
  return (
    <input
      placeholder={name ? name : baseType}
      value={value || ''}
      onChange={(event) => {
        setText(event.target.value)
        functionView.setValue(path, event.target.value)
        console.log(functionView.getValue(path))
      }}
      className="bonadocs__widget__params__name__input"
    />
  )
}

export const SelectInput = ({ path, index, baseType, functionView }) => {
  const str2bool = (value) => {
    if (value && typeof value === 'string') {
      if (value.toLowerCase() === 'true') return true
      if (value.toLowerCase() === 'false') return false
    }
  }

  const handleInputChange = (path, event) => {
    functionView.setValue(path, str2bool(event.target.value))
  }
  return (
    <select className="method__parameters__select" onChange={(event) => handleInputChange(path, event)}>
      <option value={'true'}>True</option>
      <option value={'false'}>False</option>
    </select>
  )
}
