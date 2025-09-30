import { CopyToClipboard } from "react-copy-to-clipboard";
import { Copy } from "lucide-react";

const CopySection = (props) => {
  const { roomId } = props;

  return (
    <div className="p-3 bg-gray-900 text-white rounded-lg shadow-lg max-w-xs mx-auto">
      <div className="text-lg text-center text-gray-200">
        Copy Room ID:{" "}
        <span className="text-xl text-gray-300 flex items-center">
          {roomId}
          <CopyToClipboard text={roomId}>
            <Copy
              className="ml-12 cursor-pointer text-green-500 hover:text-green-400 transition-colors duration-200 ease-in-out"
              size={22}
            />
          </CopyToClipboard>
        </span>
      </div>
    </div>
  );
};

export default CopySection;
