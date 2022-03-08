import { useState, useCallback } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'

import { ProductType } from '../services/types'
import styles from '../styles/Home.module.css'

import OrderBook from '../components/OrderBook'

const Home: NextPage = () => {
  const [productType, setProductType] = useState(ProductType.PI_XBTUSD)
  const handleToggle = useCallback(() => {
    const anotherType =
      productType === ProductType.PI_XBTUSD
        ? ProductType.PI_ETHUSD
        : ProductType.PI_XBTUSD
    setProductType(anotherType)
  }, [productType])

  return (
    <div className={styles.container}>
      <Head>
        <title>{}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <h1 className={styles.header_h1}>Order Book</h1>
      </header>

      <main className={styles.main}>
        <OrderBook productType={productType} />
      </main>

      <footer className={styles.footer}>
        <button className={styles.footer_button} onClick={handleToggle}>
          Toggle
        </button>
      </footer>
    </div>
  )
}

export default Home
