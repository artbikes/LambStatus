import React, { PropTypes } from 'react'
import classnames from 'classnames'
import Button from 'components/common/Button'
import ModestLink from 'components/common/ModestLink'
import MetricsGraph from 'components/common/MetricsGraph'
import Title from 'components/statusPage/Title'
import Incidents from 'components/statusPage/Incidents'
import ScheduledMaintenances from 'components/statusPage/ScheduledMaintenances'
import { serviceName } from 'utils/settings'
import { timeframes, getComponentColor } from 'utils/status'
import classes from './Statuses.scss'

export default class Statuses extends React.Component {
  static propTypes = {
    components: PropTypes.arrayOf(PropTypes.shape({
      componentID: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired
    }).isRequired).isRequired,
    metrics: PropTypes.arrayOf(PropTypes.shape({
      metricID: PropTypes.string.isRequired
    }).isRequired).isRequired,
    fetchComponents: PropTypes.func.isRequired,
    fetchPublicMetrics: PropTypes.func.isRequired
  }

  constructor () {
    super()
    this.state = {
      isFetching: false,
      message: '',
      timeframe: timeframes[0]
    }
  }

  fetchCallbacks = {
    onLoad: () => { this.setState({isFetching: true}) },
    onSuccess: () => { this.setState({isFetching: false}) },
    onFailure: (msg) => {
      this.setState({isFetching: false, message: msg})
    }
  }

  componentDidMount () {
    this.props.fetchComponents(this.fetchCallbacks)
    this.props.fetchPublicMetrics(this.fetchCallbacks)
  }

  clickHandler = (timeframe) => {
    return () => { this.setState({timeframe}) }
  }

  renderComponentItem = (component) => {
    let statusColor = getComponentColor(component.status)
    return (
      <li key={component.componentID} className='mdl-list__item mdl-list__item--two-line mdl-shadow--2dp'>
        <span className='mdl-list__item-primary-content'>
          <span>{component.name}</span>
          <span className='mdl-list__item-sub-title'>{component.description}</span>
        </span>
        <span className='mdl-list__item-secondary-content' style={{color: statusColor}}>
          {component.status}
        </span>
      </li>
    )
  }

  renderTimeframeSelector = () => {
    let candidates = []
    for (let i = 0; i < timeframes.length; i++) {
      let text = timeframes[i]
      if (timeframes[i] === this.state.timeframe) {
        text = <span className={classes['timeframe-checked']}>{timeframes[i]}</span>
      }
      const candidate = (
        <Button plain name={text} class={(i === 0 ? classes['timeframe-left'] : classes.timeframe)}
          key={timeframes[i]} onClick={this.clickHandler(timeframes[i])} />
      )
      candidates.push(candidate)
    }
    return candidates
  }

  renderMetrics = (metric) => {
    return <MetricsGraph key={metric.metricID} metricID={metric.metricID} timeframe={this.state.timeframe} />
  }

  render () {
    const { components, metrics } = this.props
    const componentItems = components.map(this.renderComponentItem)
    const timeframeSelector = this.renderTimeframeSelector()
    const incidents = (<Incidents classNames='mdl-cell mdl-cell--12-col mdl-list' />)
    const maintenances = (<ScheduledMaintenances classNames='mdl-cell mdl-cell--12-col mdl-list' />)

    let metricsTitle, metricsContent
    if (metrics.length !== 0) {
      let metricItems = metrics.map(this.renderMetrics)
      metricsTitle = (
        <div className='mdl-cell mdl-cell--12-col'>
          <h4 className={classnames(classes.title)}>
            Metrics
            <span className={classnames(classes.timeframes)}>
              {timeframeSelector}
            </span>
          </h4>
        </div>
      )
      metricsContent = (
        <div className='mdl-cell mdl-cell--12-col'>
          <div className='mdl-list'>
            {metricItems}
          </div>
        </div>
      )
    }

    return (<div className={classnames(classes.layout, 'mdl-grid')}
      style={{ opacity: this.state.isFetching ? 0.5 : 1 }}>
      <Title service_name={serviceName} />
      <ul className='mdl-cell mdl-cell--12-col mdl-list'>
        {componentItems}
      </ul>
      {maintenances}
      {metricsTitle}
      {metricsContent}
      <div className='mdl-cell mdl-cell--12-col'>
        <h4 className={classnames(classes.title)}>Incidents</h4>
      </div>
      {incidents}
      <ModestLink link='/history' text='Incident History' />
    </div>)
  }
}
