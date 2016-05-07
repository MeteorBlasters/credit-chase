import React, { Component } from 'react';

export class Dashboard extends Component {
  render() {
    return (
      <div className='dashboard-container'>
        <div className='score-container'>
          <span className='score'>
            CREDIT:{this.props.creditScore}
          </span>
          <span className='score'>
            LIFE:{this.props.lifeScore}
          </span>
        </div>
        <div className='logo'>
        </div>
      </div>
    )
  }
}