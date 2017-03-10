import React, { Component, PropTypes } from 'react';
import './App.scss';

export default class App extends Component {
  static propTypes = {
    socket: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.vote = this.vote.bind(this);
  }

  state = {
    votes: false,
    voting: true,
    candidates: [
      { name: 'Donald Trump' },
      { name: 'Darth Vader' },
    ],
  }

  componentDidMount() {
    const { socket } = this.props;
    socket.on('get-votes', (data) => {
      this.setState({ ...data });
      if (data.connectCounter === 1) {
        // Set timer
        setTimeout(() => {
          socket.emit('end-votes');
        }, 10000);
      }
    });

    socket.on('vote', votes => this.setState({ votes }));

    socket.on('end-votes', () => {
      const { votes } = this.state;
      const winner = votes[0] < votes[1] ? 0 : 1;
      this.setState({ voting: false, winner });
    });
  }

  vote(index) {
    const { socket } = this.props;
    socket.emit('vote', index);
  }

  render() {
    const { socket } = this.props;
    const { votes, voting, candidates, winner } = this.state;
    if (!socket || votes === false) return null;

    if (voting) {
      return (
        <main className="main">
          {candidates.map((c, i) => (
            <div className="candidate" key={c.name}>
              <div className="candidate__image" />
              <h1>{c.name}</h1>
              <button className="candidate__vote" onClick={() => this.vote(i)}>VOTE</button>
              <p><strong>Votes: </strong>{votes[i]}</p>
            </div>),
          )}
        </main>
      );
    }

    return (
      <div className="winner">{candidates[winner].name}</div>
    );
  }
}
