import React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { withStyles } from '@material-ui/core';
import styles from './style.js';

import Resizable from 're-resizable';
import {Line as LineChart} from 'react-chartjs-2';

function LineGraph({...props}) {
  const {classes} = props;
  const data = props.data || [];
  const chartConfig = {
    labels: Object.keys(data).map( element => {
      if( element === (data.length-1).toString() ) {
        return 't0'
      }
      else {
        return `${parseInt(element,10) + -1*(data.length-1)}s`
      }
    }),
    datasets: [
      {
        label: ['temperature'],
        data: data,
        borderColor: '#c0ff',
        borderWidth: .8,
        backgroundColor: '#c0f1',
        fill: true,
      }
    ]
  }

  return <Resizable
    className={classes.root}
    defaultSize = {{
      width: 800,
      height: 400,
    }}
    minWidth={500}
    maxWidth={'100%'}
    lockAspectRatio
  >
    <Card className={classes.card}>
      <CardContent>
        <LineChart data={chartConfig} options={chartOptions}/>
      </CardContent>
    </Card>
  </Resizable>
}

//look at the chartJS documentation for clarification 
//on specific keys: https://www.chartjs.org/docs/latest/
const chartOptions = {
  title: {
    display: true,
    text: 'temperature over the last 300 seconds',
    fontSize: 18,
  },
  legend: {
    display: false,
  },
  elements: {
    point: {
      radius: 0
    },
  },
  scales: {
    xAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Time (in respect to t0)',
      },
    }],
    yAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Temperature (in °C)',
      },
      ticks: {
        min: 10,
        max: 50,
      }
    }]
  }
}

export default withStyles(styles)(LineGraph)