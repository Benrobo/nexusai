export default function NexusTradeMark() {
  return (
    <div className="w-full border-t-[.5px] border-t-white-400/30 flex-center py-2 translate-y-5 gap-2 bg-white-300/50">
      <p className="text-xs font-ppReg text-white-400/40">Powered by</p>
      <img
        width={60}
        src={"/assets/images/logos/nexus-logo-2.svg"}
        className="rounded-full opacity-[.5] hover:opacity-100"
      />
    </div>
  );
}
