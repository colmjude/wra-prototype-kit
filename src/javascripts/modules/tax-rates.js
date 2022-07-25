import utils from '../utils.js'

/* global fetch */

function TaxRates ($taxSection) {
  this.$taxSection = $taxSection
}

TaxRates.prototype.init = function (options) {
  this.setOptions(options)

  // hide until location in wales found
  this.hideSection()

  // get page language - used to select attributes
  this.pageLang = document.querySelector('html').lang || 'en'

  this.$ltt = this.$taxSection.querySelector('[data-tax-info="ltt"]')
  this.$councilTax = this.$taxSection.querySelector('[data-tax-info="council-tax"]')
  this.$councilTaxTable = this.$councilTax.querySelector('table')
  this.$councilTaxArea = this.$councilTaxTable.querySelector('.app-dynamic--council-tax-area')
  this.$councilTaxTableContent = this.$councilTaxTable.querySelector('tbody')
  this.$councilTaxDocURL = this.$councilTax.querySelector('.app-dynamic--council-tax-doc')

  // the summary container
  this.$container = this.$taxSection.closest(this.options.containerSelector)

  // if location is in Wales then perform these searches
  const boundInWalesHandler = this.inWalesHandler.bind(this)
  this.$container.addEventListener(this.options.customEventName, boundInWalesHandler)

  // if location not in Wales make sure no tax sections are showing
  const boundNotInWalesHandler = this.notInWalesHandler.bind(this)
  this.$container.addEventListener('notInWales', boundNotInWalesHandler)

  return this
}

TaxRates.prototype.emptyCouncilTaxTable = function () {
  this.$councilTaxTableContent.textContent = ''
}

TaxRates.prototype.inWalesHandler = function (e) {
  console.log('inWales event heard')
  console.log(e)
  const relevantFeatures = utils.getRelevantFeatures(e.detail.data, 'localauthorities')
  if (relevantFeatures.length) {
    this.localAuthorityFeature = relevantFeatures[0]
    this.showSection()
    this.getCouncilTaxRates()
  }
}

TaxRates.prototype.getCouncilTaxRates = function () {
  if (!this.localAuthorityFeature) {
    // to do: add better handling of error cases
    return false
  }
  const that = this
  fetch(this.setEndpoint(this.localAuthorityFeature.properties.code))
    .then(response => response.json())
    .then(function (rates) {
      if (rates.length > 0) {
        that.populateCouncilTaxTable(rates)
      }
      console.log(rates)
    })
}

TaxRates.prototype.hideSection = function () {
  this.$taxSection.classList.add('js-hidden')
}

TaxRates.prototype.notInWalesHandler = function (e) {
  console.log('notInWales event heard')
  console.log(e)
  this.hideSection()
}

TaxRates.prototype.populateCouncilTaxTable = function (rates) {
  const that = this
  this.emptyCouncilTaxTable()
  this.$councilTaxArea.textContent = this.localAuthorityFeature.properties[`name_${this.pageLang}`]
  // do we need to sort rates first ?
  rates.forEach(function (rate) {
    const row = utils.createElement('tr')
    const band = rate['council-tax-band'].split(':')
    row.appendChild(utils.createElement('td', band[1].toUpperCase()))
    row.appendChild(utils.createElement('td', `£${rate.amount} ${that.$councilTax.dataset.councilTaxPeriod}`))
    that.$councilTaxTableContent.appendChild(row)
  })
  // set link to council tax documentation
  this.$councilTaxDocURL.href = rates[0][`documentation-url_${this.pageLang}`]
}

TaxRates.prototype.setEndpoint = function (geography) {
  return `/prototypes/council-tax?geography=${geography}`
}

TaxRates.prototype.showSection = function () {
  this.$taxSection.classList.remove('js-hidden')
}

TaxRates.prototype.setOptions = function (opts) {
  const options = opts || {}
  this.options = utils.extend(taxRateDefaults, options)
}

const taxRateDefaults = {
  containerSelector: '[data-locator="locator-summary"]',
  customEventName: 'inWales'
}

export default TaxRates
