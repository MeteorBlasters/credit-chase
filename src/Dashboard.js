import React, { Component } from 'react';

export class Dashboard extends Component {
  render() {
    return (
      <div className='dashboard-container'>
        <div className='score-container'>
          <span className='score'>
            LIFE SCORE:{this.props.lifeScore}
          </span>
          <span className='score right'>
            CREDIT SCORE:{this.props.creditScore}
          </span>
        </div>
        <div className='logo'>
        </div>
      </div>
    )
  }
}