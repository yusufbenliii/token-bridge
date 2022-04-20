//SPDX-License-Identifier: No License

pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";

contract BridgeStation {
    uint256 nonce;
    mapping(address => mapping(uint256 => address))
        public addressToChainIdToAddress;

    mapping(bytes32 => bool) public isExecuted;

    struct BridgeStruct {
        address tokenFromAddress;
        address tokenToAddress;
        address toAddress;
        uint256 amount;
        uint256 chainId;
        uint256 timestamp;
        uint256 nonce;
        bytes32 eventHash;
    }

    event BridgeEvent(BridgeStruct bridgeStruct);

    address public admin;

    constructor(address _admin) {
        admin = _admin;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin function");
        _;
    }

    function connectChains(
        address tokenFromAddress,
        uint256 chainId,
        address bridgedTokenAddress
    ) public onlyAdmin {
        addressToChainIdToAddress[tokenFromAddress][
            chainId
        ] = bridgedTokenAddress;
    }

    function saveLog(bytes32 eventHash) internal {
        require(!isExecuted[eventHash]);
        isExecuted[eventHash] = true;
    }

    function burnRequest(
        address tokenFromAddress,
        uint256 amount,
        uint256 chainId
    ) public {
        // require(
        //     IERC20(tokenFromAddress).transferFrom(
        //         msg.sender,
        //         address(this),
        //         amount
        //     )
        // );

        IERC20(tokenFromAddress).burnFrom(msg.sender, amount);

        address tokenToAddress = addressToChainIdToAddress[tokenFromAddress][
            chainId
        ];
        uint256 timestamp = block.timestamp;
        bytes32 eventHash = keccak256(
            abi.encodePacked(
                tokenFromAddress,
                tokenToAddress,
                msg.sender,
                amount,
                chainId,
                timestamp,
                nonce
            )
        );

        BridgeStruct memory bridgeStruct = BridgeStruct(
            tokenFromAddress,
            addressToChainIdToAddress[tokenFromAddress][chainId],
            msg.sender,
            amount,
            chainId,
            timestamp,
            nonce,
            eventHash
        );
        saveLog(bridgeStruct.eventHash);
        emit BridgeEvent(bridgeStruct);
        nonce++;
    }

    function mintRequest(BridgeStruct memory bridgeStruct) public onlyAdmin {
        require(
            IERC20(bridgeStruct.tokenToAddress).mint(
                bridgeStruct.toAddress,
                bridgeStruct.amount
            )
        );
        saveLog(bridgeStruct.eventHash);
    }
}
