import React,{ useState } from 'react'
import './IntroGame.css'
import instaimg from './logos/insta.png'
import githubimg from './logos/github.png'
export default function IntrotoGame({ play }) {
    const [showresult, setshowresult] = useState(false)
    return (
        <div className="mainbox">
            {showresult?
                <div>
                    <h2>How to play</h2><br/>
                    <div className="rules">
                        <div>
                            Objective - Each player tries to form matched sets ( a three cards set and a four cards set ) consisting of groups of three or four of a kind, or sequences of three or more cards of the same suit.
                        </div>
                        <div>
                            Ranks - A (high) ,K , Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2 .
                        </div>
                        <div>
                        Distribution of Cards - Each people will get 7 cards.The remaining cards are placed face down on the board, forming the stock.
                        </div>
                        <div>
                            The Game - Beginning with the host player , players either draw the top card of the stock or takes the top card 
                            of the discard pile and replace a card from his hand , the card dropped by player is moved face up to the discard pile. 
                            If the player has drawn from the discard pile, he may not discard the same card on that turn.
                        </div>
                        <div>
                            Action - In order to interchange with dicard pile click on discard pile card first and then click on card to be discard and 
                            click swamp ( swamp button will have green outline inorder to interchange ). If a top card is revealed then you cannot do this . 
                        </div>
                        <div>
                            Arranging - Among the seven card first four cards is considered to be four card set and last three cards considered to be three card set .
                            Player can take their own time to arrange and proceed their move . By tapping two cards among seven cards will interchange their positions .
                            Misplaced sets are not counted .
                        </div>
                    </div><br/>
                    <button onClick={()=>{setshowresult(false)}}>Back</button>
                </div>
            :
                <div>
                    <div className="gname">Set</div>
                    <button onClick={play}>Play</button>
                    <br/>
                    <button onClick={()=>{setshowresult(true)}}>How to play</button>
                    <div className="desc">
                        * Read 'How to Play' before playing . *
                    </div>
                    <div className="cne">
                        ©2021 Codingneverends
                    </div>
                    <div className="cne">
                        <a href="https://www.instagram.com/codingneverends/">
                            <img src={instaimg} alt="Error" />
                        </a>
                        <a href="https://github.com/codingneverends">
                            <img src={githubimg} alt="Error" />
                        </a>
                    </div>
                </div>
            }
        </div>
    )
}
