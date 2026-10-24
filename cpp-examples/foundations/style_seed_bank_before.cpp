// Title: A seed-bank calculation, before tidying
// Standard: C++17
// Correct, but hard to check against the model: cryptic names, unexplained
// numbers, inconsistent layout and one opaque expression.

#include <iostream>
int main()
{
  double x=500;
    for(int i=0;i<3;i++){
  x=x*0.3*0.2*12+x*(1-0.3)*0.6;
      std::cout<<"year "<<i+1<<": "<<x<<" seeds\n";}
 return 0;
}
