//always needed to write JSX
import React from 'react';
//HTTP module (makes things easy)
import axios from 'axios';

import {Button, Typography} from '@material-ui/core';
import {withStyles} from '@material-ui/core';
import styles from './style.js';

import LineGraph from 'components/LineGraph';
import DatabaseRef from 'utils/FirebaseDB';

class HomePage extends React.Component
{
  //setting the initial state
  state = {
    displayF: false,
    lowThresh: 10,
    highThresh: 40,
    phone: 'RECEIVING PHONE',
  }
  //this is a React Lifecycle method; after the component mounts, we want to call
  //the firebase method that starts the listener for our database
  componentDidMount() {
    //starts the listener; 
    //after every update to firebase, takes a snapshot then runs whatever we want on that snapshot
    DatabaseRef.on('value', snapshot => {
      //another React Lifecycle method
      this.setState({
        data: snapshot.val(),
      })
    })
  }

  componentDidUpdate() {
    if( this.state.data.temperature ) {
      const tempData = this.state.data.temperature;
      const currentTemp = tempData[tempData.length -1];

      if( currentTemp < this.state.lowThresh ) {
        this.sendSms(1)
      }

      if( currentTemp > this.state.highThresh ) {
        this.sendSms(0)
      }      
    }
  }
  //this toggles the LED; labelled as async because the firebase db.set() method
  //is asynchronous. so we will wait for it to complete before moving on.
  toggleLed = async () => {
    await DatabaseRef.set({
      ...this.state.data,
      ledActive: !this.state.data.ledActive,
    })
  }

  //this calls the Twilio backend running on AWS Cloud.
  //axios is a popular library for making HTTP requests.
  //i had the JS fetch API before, but it's kind of complicated and ugly
  //however, one should still understand how it works!
  //axios.post() takes the URL and body to post (which is a JS object)
  sendSms = async (input) => {
    const body = {
      status: input,
      phoneNumber: this.state.phone,
    }

    await axios.post('LAMBDA_URL',body);
  }

  clearGraph = async () => {
    await DatabaseRef.set({
      ...this.state.data,
      temperature: [],
    })
  }

  toggleFahrenheit = () => {
    this.setState((prevState) => {
      return { displayF: !prevState.displayF, }
    });
  }

  handleKeyPress = (keyboard,key,value) => {
    if( keyboard === 'Enter' ) {          
      if( key === 'lowThresh' && value < this.state.highThresh ) {
        this.setState({lowThresh: value});
        alert('lower threshold changed to ' + value)
      }
      if( key === 'highThresh' && value > this.state.lowThresh ) {
        this.setState({highThresh: value});
        alert('upper threshold changed to ' + value)
      }
      if( key === 'phone' && value.split('')[0] === '+' ) {
        this.setState({phone: value});
        alert('phone number changed to ' + value)
      }
    }
  }
  //React Lifecycle method: this is the last thing to run. it renders our class/component
  //and handles any logic however we want
  render() {
    //this syntax '{variableName} = object' extracts an object's key's value 
    //and assigns it to the key name as a variable; 
    //this particular variable is passed in from material ui 'withStyles'
    //link for reference: https://material-ui.com/customization/css-in-js/
    const {classes} = this.props;
    //these are assigned using some popular React practices
    //using the && is used for checks and balances (conditional rendering)
    const temperatureData = this.state.data && this.state.data.temperature;
    const activeStatus = this.state.data && this.state.data.ledActive;
    let currentTempString = 'Loading...';
    let currentTemp;
    if (temperatureData) {
      currentTemp = temperatureData[temperatureData.length-1];
      if( currentTemp === 'nothing' ) {
        currentTempString = 'unavailable...';
      }
      else {
        if( this.state.displayF ) {        
          let fahrenheit = currentTemp * 1.8 + 32;
          currentTempString = `${Math.round(fahrenheit).toFixed(0)} °F`;
        }
        else {
          currentTempString = `${Math.round(currentTemp).toFixed(0)} °C`;
        }
      }
    }
    //render must only return one element, so everything is just wrapped in a div
    return <div>
      <div className="header">
        <Typography variant="display2" color="inherit">Thermo App</Typography>
      </div>
      <div className="main">
        <div className="displayText">
        {/*you can run JS code inside of brackets to refer to other variables*/}
          <span>{`Current Temp: ${currentTempString}`}</span>
          <span>LED Active: {activeStatus ? 'YES' : 'NO'}</span>
        </div>
        { this.state.data && <LineGraph data={temperatureData}/> }        
        {/*
          * this is now an element from material ui
          * className is like HTML class, but class is a reserved keyword in JS
          * the classes prop is passed in from the withStyles higher-order-component (wrapper)
          * withStyles is stypically used to style material ui components
          * those styles are defined in an external style.js file and imported for use here
          * 
          * variant and onClick come from the Button API for this component: 
          * https://material-ui.com/api/button/#button
          */}
        <Button
          className={classes.button}
          variant="contained"
          onMouseDown={this.toggleLed}
          onMouseUp={this.toggleLed}
        >
          Hold For LED
        </Button>
        <Button
          className={classes.button}
          variant="contained"
          onClick={this.toggleFahrenheit}
        >
          Toggle Celsius/Fahrenheit
        </Button>
        <br/>
        <h4>SMS Alerts</h4>
        <label>Lower Threshold</label>
        <input
          className={classes.input}          
          name="lowThresh"              
          placeholder={this.state.lowThresh}          
          onKeyPress={event=>this.handleKeyPress(event.key,event.target.name,event.target.value)}
        />
        <br/>
        <label>Upper Threshold</label>
        <input
          className={classes.input}
          name="highThresh"
          placeholder={this.state.highThresh}
          onKeyPress={event=>this.handleKeyPress(event.key,event.target.name,event.target.value)}
        />
        <br/>
        <label>
          Phone Number to Send to (in E.164 format)*
        </label>
        <input
          className={classes.phoneInput}
          name="phone"
          placeholder={'current number: ' + this.state.phone}
          onKeyPress={event=>this.handleKeyPress(event.key,event.target.name,event.target.value)}
        />
      </div>
      <footer className={classes.footer}>
        * this means starts with +, then country code, then area code, and no spaces, no hyphens
      </footer>
    </div>
  }
}
//export using the withStyles wrapper (HOC - higher order component)
//it takes a function for the styles that is defined in an external file
//(here, that file is ./style.js)
export default withStyles(styles)(HomePage);