import java.io.*; import java.util.*;
class Resident implements Serializable {
    private static final long serialVersionUID=1L;
    String name,registerNo; transient String password; transient Object liveConnection;
    Resident(String n,String r,String p){name=n;registerNo=r;password=p;}
}
class Room implements Serializable {
    private static final long serialVersionUID=1L;
    int roomNo; List<Resident> residents=new ArrayList<>(); Room(int n){roomNo=n;}
}
class Hostel implements Serializable {
    private static final long serialVersionUID=1L;
    List<Room> rooms=new ArrayList<>();
}
public class HostelSnapshot {
    public static void main(String[] a)throws Exception {
        Hostel h=new Hostel(); Room room=new Room(101);
        room.residents.add(new Resident("Anu","REG001","not-saved")); h.rooms.add(room);
        try(ObjectOutputStream o=new ObjectOutputStream(new FileOutputStream("hostel.ser"))){o.writeObject(h);}
        try(ObjectInputStream i=new ObjectInputStream(new FileInputStream("hostel.ser"))){
            Hostel copy=(Hostel)i.readObject(); Resident r=copy.rooms.get(0).residents.get(0);
            System.out.println(r.name+" "+r.registerNo+" passwordAfterRead="+r.password);
        }
    }
}
