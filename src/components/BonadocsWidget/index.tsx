import './style.css'

import React from 'react'

export interface BonadocsWidgetProps {
  collectionCid: string
  signature: string
  fallbackDocText: string
}

export default function BonadocsWidget(props: BonadocsWidgetProps) {
  return (
    <div className="container">
      <div className="widget">
        <div className="widget__header">
          <div>
            <h2 className="widget__header__title">Write Contract</h2>
            <p className="widget__header__description">{props.fallbackDocText}</p>
          </div>

          <button className="widget__header__button">
            Try it out
            <img src="./images/chevron.svg" />
          </button>
        </div>

        <div id="widget__params" className="widget__params">
          <h3 className="widget__params__name">
            elRewardsVault (address)
            <input placeholder="from false" className="widget__params__input" value="" />
          </h3>

          <h3 className="widget__params__name">
            oracleReportSanityChecker (address)
            <input placeholder="from false" className="widget__params__input" value="" />
          </h3>

          <h3 className="widget__params__name">
            stakingRouter (address)
            <input placeholder="from false" className="widget__params__input" value="" />
          </h3>

          <h3 className="widget__params__name">
            treasury (address)
            <input placeholder="from false" className="widget__params__input" value="" />
          </h3>

          <h3 className="widget__params__name">
            withdrawalQueue (address)
            <input placeholder="from false" className="widget__params__input" value="" />
          </h3>
          <h3 className="widget__params__name">
            withdrawalVault (address)
            <input placeholder="from false" className="widget__params__input" value="" />
          </h3>
          <input id="ctn__button" className="widget__params__button" type="button" value="Connect Wallet" />
          <input id="query__button" className="widget__params__button" type="button" value="Query" />
          <div id="wallet__status" className="widget__status"></div>
        </div>

        <div className="widget__codeblock">
          <pre>
            <code>
              {/* 
                  <!-- Method Without Param -->
                  <!-- <span className="widget__codeblock__inner">
                    <span className="widget__codeblock__inner__function">function</span> <span className="widget__codeblock__inner__name">accountingOracle </span> <span className="widget__codeblock__inner__parenthesis">()</span> <span className="widget__codeblock__inner__view">view returns</span> <span className="widget__codeblock__inner__parenthesis">(</span> <span className="widget__codeblock__inner__param">address</span> <span className="widget__codeblock__inner__parenthesis">)</span>  
                  </span> -->
                  <!-- Method With Param(s) -->
                  */}
              <span className="widget__codeblock__inner">
                <span className="widget__codeblock__inner__function">function</span>{' '}
                <span className="widget__codeblock__inner__name">coreComponents</span>{' '}
                <span className="widget__codeblock__inner__parenthesis">()</span>{' '}
                <span className="widget__codeblock__inner__view">view returns</span>{' '}
                <span className="widget__codeblock__inner__parenthesis">(</span>
              </span>
              <span className="widget__codeblock__inner ml-4">
                <span className="widget__codeblock__inner__name">address</span>{' '}
                <span className="widget__codeblock__inner__view">elRewardsVault</span>
              </span>
              <br />
              <span className="widget__codeblock__inner ml-4">
                {' '}
                <span className="widget__codeblock__inner__name">address</span>{' '}
                <span className="widget__codeblock__inner__view">oracleReportSanityChecker</span>
              </span>
              <span className="widget__codeblock__inner ml-4">
                {' '}
                <span className="widget__codeblock__inner__name">address</span>{' '}
                <span className="widget__codeblock__inner__view">stakingRouter</span>
              </span>
              <span className="widget__codeblock__inner ml-4">
                {' '}
                <span className="widget__codeblock__inner__name">address</span>{' '}
                <span className="widget__codeblock__inner__view">treasury</span>
              </span>
              <span className="widget__codeblock__inner ml-4">
                {' '}
                <span className="widget__codeblock__inner__name">address</span>{' '}
                <span className="widget__codeblock__inner__view">withdrawalQueue</span>
              </span>
              <span className="widget__codeblock__inner ml-4">
                {' '}
                <span className="widget__codeblock__inner__name">address</span>{' '}
                <span className="widget__codeblock__inner__view">withdrawalVault</span>
              </span>
              <span className="widget__codeblock__inner widget__codeblock__inner__parenthesis">)</span>
            </code>
          </pre>
        </div>

        <div className="widget__footer">
          <span className="widget__footer__logo">
            powered by
            <img className="widget__footer__logo__img" src="./images/logo.svg" />
          </span>
          <div className="widget__footer__info">Learn more</div>
        </div>
      </div>
    </div>
  )
}
